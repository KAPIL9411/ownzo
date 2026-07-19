'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ListingService } from '@/frontend/services/listing.service'
import { CategoryService } from '@/frontend/services/category.service'
import { ApiService } from '@/frontend/services/api.service'
import { TrustEngineService } from '@/frontend/services/trust-engine.service'
import { AIDescriptionService } from '@/frontend/services/ai-description.service'
import { LocationService } from '@/frontend/services/location.service'
import { Button } from '@/frontend/components/ui/button'
import { useToast } from '@/frontend/components/ui/toast'
import { useRouter } from 'next/navigation'
import {
  Upload, X, ArrowLeft, ArrowRight, Shield, MapPin, Sparkles, Loader2,
  Image as ImageIcon, Video, AlertTriangle, CheckCircle2, Info, Camera,
  FileText, BadgeCheck, Circle,
} from 'lucide-react'
import { cn } from '@/frontend/lib/utils'
import Link from 'next/link'
import { TrustAssessmentModal } from '@/frontend/components/trust/TrustAssessmentModal'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const HIGH_VALUE_THRESHOLD = 5000   // ₹5,000 — verification required
const PREMIUM_THRESHOLD    = 10000  // ₹10,000 — 5 photos required

const MIN_PHOTOS_STANDARD    = 3
const MIN_PHOTOS_HIGH_VALUE  = 3
const MIN_PHOTOS_PREMIUM     = 5

const schema = z.object({
  title:       z.string().min(5, 'At least 5 characters').max(100, 'Max 100 characters'),
  description: z.string().min(20, 'At least 20 characters').max(2000, 'Max 2000 characters'),
  categoryId:  z.string().min(1, 'Select a category'),
  price:       z.number({ invalid_type_error: 'Enter a valid price' }).positive('Price must be positive'),
  negotiable:  z.boolean(),
  condition:   z.enum(['new', 'like-new', 'good', 'fair', 'poor']),
  city:        z.string().min(2, 'Enter your city'),
  locality:    z.string().optional(),
})
type FormData = z.infer<typeof schema>

const CONDITIONS = [
  { value: 'new',      label: 'New',      desc: 'Unused, in original packaging' },
  { value: 'like-new', label: 'Like New', desc: 'Barely used, no visible wear' },
  { value: 'good',     label: 'Good',     desc: 'Some signs of use, fully functional' },
  { value: 'fair',     label: 'Fair',     desc: 'Visible wear, works perfectly' },
  { value: 'poor',     label: 'Poor',     desc: 'Heavy wear, may have issues' },
]

// ---------------------------------------------------------------------------
// Helper — live requirement banner shown throughout the form
// ---------------------------------------------------------------------------
function VerificationBanner({ price }: { price: number }) {
  if (!price || price < HIGH_VALUE_THRESHOLD) return null

  const isPremium = price >= PREMIUM_THRESHOLD

  return (
    <div className={cn(
      'flex gap-3 p-3.5 rounded-xl border text-sm',
      isPremium
        ? 'bg-orange-50 border-orange-200 text-orange-800'
        : 'bg-blue-50 border-blue-200 text-blue-800'
    )}>
      <Shield className="h-4 w-4 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-semibold">
          {isPremium ? '🔒 Premium Verification Required' : '🛡️ Verification Required'}
        </p>
        <p className="text-xs opacity-80">
          {isPremium
            ? `Items priced ₹${PREMIUM_THRESHOLD.toLocaleString()}+ need: 5 photos, a live verification photo with handwritten code, and a serial number or invoice.`
            : `Items priced ₹${HIGH_VALUE_THRESHOLD.toLocaleString()}+ need: a live verification photo showing you holding the item, to protect buyers from fraud.`}
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Steps definition (dynamic — adds Verification step for high-value)
// ---------------------------------------------------------------------------
function getSteps(isHighValue: boolean) {
  const base = ['Details', 'Photos & Video', 'Pricing']
  if (isHighValue) base.push('Verification')
  base.push('Review')
  return base
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function CreateListingPage() {
  const router    = useRouter()
  const { toast } = useToast()

  const [step,           setStep]           = useState(0)
  const [images,         setImages]         = useState<string[]>([])
  const [video,          setVideo]          = useState<string>('')
  const [uploading,      setUploading]      = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)

  // Verification photo (high-value items)
  const [verificationPhoto,         setVerificationPhoto]         = useState<string>('')
  const [uploadingVerificationPhoto, setUploadingVerificationPhoto] = useState(false)

  // AI description
  const [generatingDescription, setGeneratingDescription] = useState(false)
  const [descriptionMode,       setDescriptionMode]       = useState<'manual' | 'ai'>('manual')

  // Location
  const [fetchingLocation, setFetchingLocation] = useState(false)
  const [locationFetched,  setLocationFetched]  = useState(false)

  // Trust Engine
  const [assessmentModal,  setAssessmentModal]  = useState<'closed' | 'checking' | 'result'>('closed')
  const [assessmentResult, setAssessmentResult] = useState<any>(null)
  const [finalFormData,    setFinalFormData]    = useState<FormData | null>(null)

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => CategoryService.getCategories(),
  })
  const categories = categoriesData?.data ?? []

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
    resolver:      zodResolver(schema),
    defaultValues: { negotiable: true, condition: 'good' },
  })

  const watched = watch()

  // Derived flags
  const price        = watched.price ?? 0
  const isHighValue  = price >= HIGH_VALUE_THRESHOLD
  const isPremium    = price >= PREMIUM_THRESHOLD
  const minPhotos    = isPremium ? MIN_PHOTOS_PREMIUM : (isHighValue ? MIN_PHOTOS_HIGH_VALUE : MIN_PHOTOS_STANDARD)
  const STEPS        = getSteps(isHighValue)
  const reviewStep   = STEPS.length - 1
  const verifyStep   = isHighValue ? STEPS.length - 2 : -1   // -1 means no verify step

  const selectedCategory = categories.find((c) => c.id === watched.categoryId)

  // Auto-fetch location on mount
  useEffect(() => { autoFetchLocation() }, [])

  async function autoFetchLocation() {
    setFetchingLocation(true)
    try {
      const result = await LocationService.getLocationWithStatus()
      if (result.success && result.data) {
        setValue('city', result.data.city)
        if (result.data.locality) setValue('locality', result.data.locality)
        setLocationFetched(true)
        toast({ type: 'success', title: `📍 Location detected: ${result.data.city}`, description: 'You can change it if needed' })
      }
    } catch { /* silent */ } finally { setFetchingLocation(false) }
  }

  async function handleGenerateDescription() {
    if (!watched.title || watched.title.trim().length < 5) {
      toast({ type: 'warning', title: 'Enter a title first to generate description' }); return
    }
    setGeneratingDescription(true)
    try {
      const result = await AIDescriptionService.generateDescription({
        title: watched.title, category: selectedCategory?.name,
        condition: watched.condition, price: watched.price,
        existingDescription: watched.description || undefined,
      })
      setValue('description', result.description)
      setDescriptionMode('ai')
      toast({ type: 'success', title: '✨ Description generated!', description: 'You can edit it to add more details' })
    } catch (error: any) {
      const msg = error?.message || ''
      const isKeyError = msg.includes('invalid or expired')
      toast({
        type: 'error',
        title: isKeyError ? 'AI key expired' : 'Failed to generate description',
        description: isKeyError ? 'Get a new free GROQ key at console.groq.com' : (msg || 'Please write it manually'),
      })
    } finally { setGeneratingDescription(false) }
  }

  const createMutation = useMutation({
    mutationFn: (data: FormData) => ListingService.createListing({
      ...data,
      images,
      video: video || undefined,
      verificationStatus: assessmentResult?.decision === 'auto_publish'   ? 'verified'
                        : assessmentResult?.decision === 'require_review' ? 'pending' : 'unverified',
      status: assessmentResult?.decision === 'reject'         ? 'draft'
            : assessmentResult?.decision === 'require_review' ? 'pending_review' : 'active',
      categorySpecificData: verificationPhoto
        ? { verificationPhoto, invoice: undefined, serialNumber: undefined }
        : undefined,
    }),
    onSuccess: (res) => {
      const d = assessmentResult?.decision
      toast({
        type: 'success',
        title: d === 'auto_publish'   ? '✅ Listing Published!'
             : d === 'require_review' ? '🔍 Submitted for Review'
             : 'Listing created!',
        description: d === 'require_review' ? "We'll review it within 24-48 hours." : 'Your item is now live.',
      })
      router.push(`/listings/${res.data?.id}`)
    },
    onError: () => toast({ type: 'error', title: 'Failed to create listing', description: 'Please try again.' }),
  })

  async function handleTrustAssessment(data: FormData) {
    setFinalFormData(data)
    setAssessmentModal('checking')
    try {
      const response = await TrustEngineService.assessListing({
        title: data.title, description: data.description, price: data.price,
        categoryId: data.categoryId, condition: data.condition,
        city: data.city, locality: data.locality, images,
        video: video || undefined,
        categorySpecificData: verificationPhoto ? { verificationPhoto } : undefined,
      })
      if (response.success) {
        setAssessmentResult(response.data)
        setAssessmentModal('result')
      } else {
        throw new Error(response.message || 'Assessment failed')
      }
    } catch (error: any) {
      setAssessmentModal('closed')
      // Extract detailed message from axios error response
      const detail = error?.response?.data?.message || error?.message || 'Unable to assess listing. Please try again.'
      toast({ type: 'error', title: 'Listing Check Failed', description: detail })
    }
  }

  function handleAssessmentContinue() {
    if (!finalFormData) return
    const decision = assessmentResult?.decision
    // All outcomes except reject → create the listing with appropriate status
    if (decision !== 'reject') {
      setAssessmentModal('closed')
      createMutation.mutate(finalFormData)
    } else {
      // reject → go back to step 0 so user can fix
      setAssessmentModal('closed')
      setStep(0)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    if (images.length + files.length > 10) { toast({ type: 'warning', title: 'Max 10 images allowed' }); return }
    setUploading(true)
    try {
      const results = await Promise.all(Array.from(files).map((f) => ApiService.uploadFile(f, 'image')))
      setImages((prev) => [...prev, ...results.map((r) => r.data.url)])
      toast({ type: 'success', title: `${files.length} photo${files.length > 1 ? 's' : ''} uploaded` })
    } catch { toast({ type: 'error', title: 'Upload failed', description: 'Check your internet connection.' }) }
    finally { setUploading(false) }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) { toast({ type: 'warning', title: 'Video must be under 50MB' }); return }
    setUploadingVideo(true)
    try {
      const result = await ApiService.uploadFile(file, 'video')
      setVideo(result.data.url)
      toast({ type: 'success', title: 'Video uploaded!' })
    } catch { toast({ type: 'error', title: 'Video upload failed' }) }
    finally { setUploadingVideo(false) }
  }

  async function handleVerificationPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingVerificationPhoto(true)
    try {
      const result = await ApiService.uploadFile(file, 'image')
      setVerificationPhoto(result.data.url)
      toast({ type: 'success', title: '✅ Verification photo uploaded!' })
    } catch { toast({ type: 'error', title: 'Upload failed' }) }
    finally { setUploadingVerificationPhoto(false) }
  }

  async function nextStep() {
    let fields: (keyof FormData)[] = []
    if (step === 0) fields = ['title', 'description', 'categoryId', 'condition', 'city']
    if (step === 1) {
      if (images.length < minPhotos) {
        toast({ type: 'warning', title: `Add at least ${minPhotos} photos`, description: isPremium ? 'Required for high-value items' : 'Improves trust score' })
        return
      }
    }
    if (step === 2) {
      fields = ['price']
      const ok = await trigger(fields)
      if (!ok) return
      // When price changes to high-value and we're past verify step, reset step count handled by dynamic STEPS
      setStep((s) => s + 1)
      return
    }
    if (step === verifyStep) {
      if (isHighValue && !verificationPhoto) {
        toast({ type: 'warning', title: 'Verification photo required', description: `Required for items above ₹${HIGH_VALUE_THRESHOLD.toLocaleString()}` })
        return
      }
    }
    const ok = fields.length === 0 || await trigger(fields)
    if (ok) setStep((s) => s + 1)
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/listings"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="section-title">Sell an Item</h1>
          <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={cn('h-1.5 rounded-full transition-all duration-300', i <= step ? 'bg-primary' : 'bg-muted')} />
            <p className={cn('text-xs mt-1 font-medium truncate', i === step ? 'text-primary' : 'text-muted-foreground')}>{s}</p>
          </div>
        ))}
      </div>

      {/* Global high-value banner (shown on all steps when price is known) */}
      {step > 2 && <VerificationBanner price={price} />}

      <form onSubmit={handleSubmit(handleTrustAssessment)}>

        {/* ---------------------------------------------------------------- */}
        {/* STEP 0 — Details                                                  */}
        {/* ---------------------------------------------------------------- */}
        {step === 0 && (
          <div className="rounded-xl border bg-card p-6 space-y-5">

            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title *</label>
              <input {...register('title')} className="input-field" placeholder="e.g., MacBook Air M2 256GB Space Grey" autoFocus />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">{watched.title?.length ?? 0}/100</p>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Description *</label>
                <Button type="button" variant="ghost" size="sm"
                  onClick={handleGenerateDescription}
                  disabled={generatingDescription || !watched.title}
                  className="h-7 text-xs gap-1.5"
                >
                  {generatingDescription
                    ? <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
                    : <><Sparkles className="h-3 w-3" /> AI Generate</>}
                </Button>
              </div>
              <textarea {...register('description')} rows={5} className="input-field resize-none"
                placeholder="Describe your item — accessories, box, receipt, reason for selling…"
                onChange={() => setDescriptionMode('manual')}
              />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">{watched.description?.length ?? 0}/2000</p>
                {descriptionMode === 'ai' && (
                  <p className="text-xs text-primary flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI Generated</p>
                )}
              </div>
            </div>

            {/* Category + City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category *</label>
                <select {...register('categoryId')} className="input-field h-10">
                  <option value="">Select…</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
                {errors.categoryId && <p className="text-xs text-destructive mt-1">{errors.categoryId.message}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium">City *</label>
                  {!locationFetched && (
                    <Button type="button" variant="ghost" size="sm" onClick={autoFetchLocation} disabled={fetchingLocation} className="h-6 text-xs gap-1">
                      {fetchingLocation ? <><Loader2 className="h-3 w-3 animate-spin" /> Detecting...</> : <><MapPin className="h-3 w-3" /> Auto-detect</>}
                    </Button>
                  )}
                </div>
                <input {...register('city')} className="input-field h-10" placeholder="Mumbai" />
                {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
                {locationFetched && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Auto-detected</p>}
              </div>
            </div>

            {/* Locality */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Locality <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input {...register('locality')} className="input-field" placeholder="Andheri West, Koramangala…" />
            </div>

            {/* Condition */}
            <div>
              <label className="text-sm font-medium mb-3 block">Condition *</label>
              <div className="space-y-2">
                {CONDITIONS.map(({ value, label, desc }) => (
                  <label key={value} className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                    watched.condition === value ? 'border-primary bg-accent/50' : 'hover:border-muted-foreground/40'
                  )}>
                    <input type="radio" value={value} {...register('condition')} className="accent-primary" />
                    <div>
                      <span className="font-medium text-sm">{label}</span>
                      <span className="text-xs text-muted-foreground ml-2">{desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* STEP 1 — Photos & Video                                           */}
        {/* ---------------------------------------------------------------- */}
        {step === 1 && (
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div>
              <h2 className="font-semibold mb-0.5">Add Photos</h2>
              <p className="text-sm text-muted-foreground">
                {isPremium
                  ? `Upload at least ${MIN_PHOTOS_PREMIUM} photos — required for items above ₹${PREMIUM_THRESHOLD.toLocaleString()}.`
                  : isHighValue
                  ? `Upload at least ${MIN_PHOTOS_HIGH_VALUE} photos to build buyer trust.`
                  : 'Good photos get more buyers. Add up to 10 images.'}
              </p>
            </div>

            {/* Photo count indicator */}
            <div className="flex items-center gap-2">
              {Array.from({ length: minPhotos }).map((_, i) => (
                <div key={i} className={cn(
                  'h-1.5 flex-1 rounded-full transition-all',
                  i < images.length ? 'bg-primary' : 'bg-muted'
                )} />
              ))}
              <span className="text-xs text-muted-foreground ml-1 shrink-0">
                {images.length}/{minPhotos} required
              </span>
            </div>

            {/* High-value photo tip */}
            {isHighValue && images.length < minPhotos && (
              <div className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>
                  {isPremium
                    ? `Items above ₹${PREMIUM_THRESHOLD.toLocaleString()} need at least ${MIN_PHOTOS_PREMIUM} photos. Add ${Math.max(0, minPhotos - images.length)} more.`
                    : `Items above ₹${HIGH_VALUE_THRESHOLD.toLocaleString()} need at least ${MIN_PHOTOS_HIGH_VALUE} photos. Add ${Math.max(0, minPhotos - images.length)} more.`}
                </span>
              </div>
            )}

            {/* Photo grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className={cn(
                  'relative aspect-square rounded-xl overflow-hidden border-2',
                  i === 0 ? 'border-primary' : i < minPhotos ? 'border-green-400' : 'border-transparent'
                )}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold text-center py-0.5">COVER</span>
                  )}
                  <button type="button" onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 10 && (
                <label className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-accent/30 transition-all">
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                  {uploading
                    ? <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    : <><Upload className="h-7 w-7 text-muted-foreground mb-1" /><span className="text-xs text-muted-foreground text-center px-2">{images.length === 0 ? 'Add photos' : 'Add more'}</span></>}
                </label>
              )}
            </div>

            {images.length === 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
                <ImageIcon className="h-4 w-4 shrink-0" />
                At least 1 photo is required to create a listing.
              </div>
            )}

            {/* Success when enough photos */}
            {images.length >= minPhotos && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {images.length} photos uploaded — photo requirement met ✓
              </div>
            )}

            {/* Video */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-1">Video <span className="text-muted-foreground font-normal">(optional)</span></h3>
              <p className="text-xs text-muted-foreground mb-3">Short demo video — max 50MB. Great for electronics, vehicles, etc.</p>
              {video ? (
                <div className="relative rounded-xl overflow-hidden bg-black">
                  <video src={video} controls className="w-full max-h-48 object-contain" />
                  <button type="button" onClick={() => setVideo('')}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3 p-4 border-2 border-dashed border-muted-foreground/30 rounded-xl cursor-pointer hover:border-primary hover:bg-accent/20 transition-all">
                  <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploadingVideo} className="hidden" />
                  {uploadingVideo ? <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" /> : <Video className="h-6 w-6 text-muted-foreground" />}
                  <div>
                    <p className="text-sm font-medium">{uploadingVideo ? 'Uploading…' : 'Upload a video'}</p>
                    <p className="text-xs text-muted-foreground">MP4, MOV, AVI · Max 50MB</p>
                  </div>
                </label>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* STEP 2 — Pricing                                                  */}
        {/* ---------------------------------------------------------------- */}
        {step === 2 && (
          <div className="rounded-xl border bg-card p-6 space-y-5">
            <div>
              <h2 className="font-semibold mb-1">Set Your Price</h2>
              <p className="text-sm text-muted-foreground">Price competitively to attract more buyers.</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Price (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                <input type="number" {...register('price', { valueAsNumber: true })}
                  className="input-field pl-8 text-lg font-semibold" placeholder="0" autoFocus />
              </div>
              {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
            </div>

            {/* Live verification tier indicator */}
            {price > 0 && (
              <div className="space-y-2">
                {/* Tier thresholds visual */}
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 via-amber-400 to-orange-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (price / 15000) * 100)}%` }} />
                  {/* Threshold markers */}
                  <div className="absolute inset-y-0 w-px bg-amber-600" style={{ left: `${(HIGH_VALUE_THRESHOLD / 15000) * 100}%` }} />
                  <div className="absolute inset-y-0 w-px bg-orange-600" style={{ left: `${(PREMIUM_THRESHOLD / 15000) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>₹0</span>
                  <span className={cn('font-medium', isHighValue ? 'text-amber-600' : '')}>
                    ₹{HIGH_VALUE_THRESHOLD.toLocaleString()} verification
                  </span>
                  <span className={cn('font-medium', isPremium ? 'text-orange-600' : '')}>
                    ₹{PREMIUM_THRESHOLD.toLocaleString()} premium
                  </span>
                </div>

                {/* What this price tier requires */}
                <div className={cn(
                  'p-3 rounded-xl border text-xs space-y-1.5',
                  isPremium    ? 'bg-orange-50 border-orange-200 text-orange-800'
                  : isHighValue ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-green-50 border-green-200 text-green-700'
                )}>
                  <p className="font-semibold flex items-center gap-1.5">
                    {isPremium ? <Shield className="h-3.5 w-3.5" /> : isHighValue ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    {isPremium ? 'Premium verification required' : isHighValue ? 'Verification required' : 'Standard listing — no extra verification'}
                  </p>
                  <ul className="space-y-0.5 ml-5 list-disc">
                    {isPremium && <li>Minimum {MIN_PHOTOS_PREMIUM} product photos</li>}
                    {isPremium && <li>Live verification photo with handwritten code</li>}
                    {isPremium && <li>Serial number or invoice recommended</li>}
                    {isHighValue && !isPremium && <li>Minimum {MIN_PHOTOS_HIGH_VALUE} product photos</li>}
                    {isHighValue && !isPremium && <li>Live verification photo (you holding the item)</li>}
                    {!isHighValue && <li>Minimum {MIN_PHOTOS_STANDARD} photos recommended</li>}
                    {!isHighValue && <li>Clear description helps buyers trust you</li>}
                  </ul>
                  {isHighValue && (
                    <p className="mt-1 opacity-70">A verification step will be added after pricing.</p>
                  )}
                </div>
              </div>
            )}

            <label className={cn('flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all',
              watched.negotiable ? 'border-primary bg-accent/40' : 'hover:border-muted-foreground/40')}>
              <input type="checkbox" {...register('negotiable')} className="h-4 w-4 accent-primary" />
              <div>
                <p className="font-medium text-sm">Open to offers</p>
                <p className="text-xs text-muted-foreground">Buyers can send you a lower price offer</p>
              </div>
            </label>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* STEP 3 — Verification (only shown for high-value items)           */}
        {/* ---------------------------------------------------------------- */}
        {step === verifyStep && isHighValue && (
          <div className="rounded-xl border bg-card p-6 space-y-5">

            {/* Header */}
            <div className="flex items-start gap-3">
              <div className={cn('p-2.5 rounded-xl', isPremium ? 'bg-orange-100' : 'bg-blue-100')}>
                <Shield className={cn('h-5 w-5', isPremium ? 'text-orange-600' : 'text-blue-600')} />
              </div>
              <div>
                <h2 className="font-semibold">Verification Photo</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Required for items priced above ₹{HIGH_VALUE_THRESHOLD.toLocaleString()}. This protects buyers and boosts your trust score.
                </p>
              </div>
            </div>

            {/* Instructions card */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4" /> How to take a verification photo:</p>
              <ol className="text-sm space-y-2 ml-6 list-decimal text-muted-foreground">
                <li>Write today's date and the word <strong className="text-foreground">"OWNZO"</strong> on a piece of paper</li>
                <li>Hold the paper <strong className="text-foreground">next to the item</strong> in the photo</li>
                <li>Make sure the item is clearly visible</li>
                {isPremium && <li>Include the serial number sticker or invoice in the frame if possible</li>}
              </ol>
            </div>

            {/* Example visual */}
            <div className="flex gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs">
              <Camera className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Example: </p>
                <p className="opacity-80">📸 Item + paper saying "Ownzo — {new Date().toLocaleDateString('en-IN')}"</p>
              </div>
            </div>

            {/* Upload area */}
            {verificationPhoto ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-green-400">
                <img src={verificationPhoto} alt="Verification" className="w-full max-h-64 object-cover" />
                <div className="absolute inset-0 bg-green-500/10 flex items-end p-3">
                  <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Verification photo uploaded
                  </span>
                </div>
                <button type="button" onClick={() => setVerificationPhoto('')}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-muted-foreground/30 rounded-xl cursor-pointer hover:border-primary hover:bg-accent/20 transition-all">
                <input type="file" accept="image/*" onChange={handleVerificationPhotoUpload} disabled={uploadingVerificationPhoto} className="hidden" />
                {uploadingVerificationPhoto ? (
                  <><div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /><p className="text-sm text-muted-foreground">Uploading…</p></>
                ) : (
                  <>
                    <div className={cn('p-4 rounded-full', isPremium ? 'bg-orange-100' : 'bg-blue-100')}>
                      <Camera className={cn('h-8 w-8', isPremium ? 'text-orange-500' : 'text-blue-500')} />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm">Upload verification photo</p>
                      <p className="text-xs text-muted-foreground mt-0.5">You holding the item with "Ownzo + today's date" written on paper</p>
                    </div>
                  </>
                )}
              </label>
            )}

            {/* Why this matters */}
            <div className="flex gap-2 text-xs text-muted-foreground p-3 bg-muted/50 rounded-xl">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>This photo is reviewed by Ownzo and shared with buyers on request. It proves the item is real and in your possession.</span>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* STEP 4 (or 3) — Review                                           */}
        {/* ---------------------------------------------------------------- */}
        {step === reviewStep && (
          <div className="space-y-4">
            {/* Listing preview card */}
            <div className="rounded-xl border bg-card p-6 space-y-5">
              <h2 className="font-semibold">Review Your Listing</h2>

              <div className="flex gap-4">
                {images[0] && (
                  <div className="h-24 w-24 rounded-xl overflow-hidden border shrink-0">
                    <img src={images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold line-clamp-2">{watched.title || '—'}</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {watched.price ? `₹${watched.price.toLocaleString()}` : '—'}
                    {watched.negotiable && <span className="text-xs font-normal text-muted-foreground ml-2">Negotiable</span>}
                  </p>
                  {isHighValue && (
                    <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1',
                      isPremium ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700')}>
                      <Shield className="h-2.5 w-2.5" /> {isPremium ? 'Premium Verified' : 'Verified Listing'}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Category',  value: selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : '—' },
                  { label: 'Condition', value: watched.condition?.replace('-', ' ') || '—' },
                  { label: 'Location',  value: [watched.city, watched.locality].filter(Boolean).join(', ') || '—' },
                  { label: 'Photos',    value: `${images.length} photo${images.length !== 1 ? 's' : ''}` },
                  { label: 'Video',     value: video ? '1 video' : 'None' },
                  ...(isHighValue ? [{ label: 'Verification', value: verificationPhoto ? '✅ Photo uploaded' : '❌ Missing' }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-xs mb-1">{label}</p>
                    <p className="font-medium capitalize">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pre-publish checklist */}
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-primary" /> Pre-publish checklist
              </h3>
              {[
                { label: 'Title is descriptive (5+ chars)',     done: (watched.title?.length ?? 0) >= 5 },
                { label: 'Description added (20+ chars)',       done: (watched.description?.length ?? 0) >= 20 },
                { label: 'Category selected',                   done: !!watched.categoryId },
                { label: 'At least 1 photo uploaded',          done: images.length >= 1 },
                { label: `${minPhotos} photos (recommended)`,  done: images.length >= minPhotos },
                { label: 'Price set',                          done: !!watched.price && watched.price > 0 },
                { label: 'Location set',                        done: !!watched.city },
                ...(isHighValue ? [{ label: 'Verification photo uploaded', done: !!verificationPhoto }] : []),
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm">
                  {done
                    ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    : <Circle     className="h-4 w-4 text-muted-foreground shrink-0" />}
                  <span className={done ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
                </div>
              ))}
            </div>

            {/* What happens next */}
            <div className="rounded-xl border bg-card p-5 space-y-2">
              <h3 className="font-semibold text-sm">What happens when you submit?</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex gap-2"><Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>Ownzo Trust Engine will verify your listing before it goes live.</span></p>
                <p className="flex gap-2"><BadgeCheck className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /><span>Score 80+ → Published instantly.</span></p>
                <p className="flex gap-2"><AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /><span>Score 60–79 → Published with improvement suggestions.</span></p>
                <p className="flex gap-2"><Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" /><span>Score below 60 → Reviewed manually within 1–2 hours.</span></p>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Navigation buttons                                                */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </Button>
          )}

          {step < STEPS.length - 1 ? (
            <Button type="button" className="flex-1" onClick={nextStep}>
              Continue <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex-1"
              disabled={createMutation.isPending || (isHighValue && !verificationPhoto)}
            >
              {createMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publishing…</>
              ) : (
                <><Shield className="h-4 w-4 mr-2" /> Verify & Publish</>
              )}
            </Button>
          )}
        </div>

        {/* Disabled submit hint when verification photo is missing */}
        {step === reviewStep && isHighValue && !verificationPhoto && (
          <p className="text-xs text-center text-destructive mt-2 flex items-center justify-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Go back to the Verification step and upload a photo before publishing.
          </p>
        )}
      </form>

      {/* ------------------------------------------------------------------ */}
      {/* Trust Assessment Modal                                               */}
      {/* ------------------------------------------------------------------ */}
      <TrustAssessmentModal
        isOpen={assessmentModal !== 'closed'}
        stage={assessmentModal}
        result={assessmentResult ? {
          decision:     assessmentResult.decision,
          overallScore: assessmentResult.overallScore,
          message:      assessmentResult.message,
          improvements: assessmentResult.improvements,
          warnings:     assessmentResult.warnings,
        } : undefined}
        onClose={() => setAssessmentModal('closed')}
        onContinue={handleAssessmentContinue}
      />
    </div>
  )
}
