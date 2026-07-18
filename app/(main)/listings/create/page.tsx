'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ListingService } from '@/frontend/services/listing.service'
import { CategoryService } from '@/frontend/services/category.service'
import { ApiService } from '@/frontend/services/api.service'
import { Button } from '@/frontend/components/ui/button'
import { useToast } from '@/frontend/components/ui/toast'
import { useRouter } from 'next/navigation'
import { Upload, X, ArrowLeft, ArrowRight, CheckCircle, Image as ImageIcon, Video, Play } from 'lucide-react'
import { cn } from '@/frontend/lib/utils'
import Link from 'next/link'

const schema = z.object({
  title: z.string().min(5, 'At least 5 characters').max(100, 'Max 100 characters'),
  description: z.string().min(20, 'At least 20 characters').max(2000, 'Max 2000 characters'),
  categoryId: z.string().min(1, 'Select a category'),
  price: z.number({ invalid_type_error: 'Enter a valid price' }).positive('Price must be positive'),
  negotiable: z.boolean(),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']),
  city: z.string().min(2, 'Enter your city'),
  locality: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const CONDITIONS = [
  { value: 'new', label: 'New', desc: 'Unused, in original packaging' },
  { value: 'like-new', label: 'Like New', desc: 'Barely used, no visible wear' },
  { value: 'good', label: 'Good', desc: 'Some signs of use, fully functional' },
  { value: 'fair', label: 'Fair', desc: 'Visible wear, works perfectly' },
  { value: 'poor', label: 'Poor', desc: 'Heavy wear, may have issues' },
]

const STEPS = ['Details', 'Photos & Video', 'Pricing', 'Review']

export default function CreateListingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const [video, setVideo] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => CategoryService.getCategories(),
  })
  const categories = categoriesData?.data ?? []

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { negotiable: true, condition: 'good' },
  })

  const watched = watch()

  const createMutation = useMutation({
    mutationFn: (data: FormData) => ListingService.createListing({ ...data, images, video: video || undefined }),
    onSuccess: (res) => {
      toast({ type: 'success', title: 'Listing created!', description: 'Your item is now live.' })
      router.push(`/listings/${res.data?.id}`)
    },
    onError: () => toast({ type: 'error', title: 'Failed to create listing', description: 'Please try again.' }),
  })

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      toast({ type: 'warning', title: 'Video must be under 50MB' })
      return
    }
    setUploadingVideo(true)
    try {
      const result = await ApiService.uploadFile(file, 'video')
      setVideo(result.data.url)
      toast({ type: 'success', title: 'Video uploaded!' })
    } catch {
      toast({ type: 'error', title: 'Video upload failed' })
    } finally {
      setUploadingVideo(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    if (images.length + files.length > 10) {
      toast({ type: 'warning', title: 'Max 10 images allowed' })
      return
    }
    setUploading(true)
    try {
      const results = await Promise.all(Array.from(files).map((f) => ApiService.uploadFile(f, 'image')))
      setImages((prev) => [...prev, ...results.map((r) => r.data.url)])
      toast({ type: 'success', title: `${files.length} photo${files.length > 1 ? 's' : ''} uploaded` })
    } catch {
      toast({ type: 'error', title: 'Upload failed', description: 'Check your internet connection.' })
    } finally {
      setUploading(false)
    }
  }

  async function nextStep() {
    let fields: (keyof FormData)[] = []
    if (step === 0) fields = ['title', 'description', 'categoryId', 'condition', 'city']
    if (step === 1) {
      if (images.length === 0) { toast({ type: 'warning', title: 'Add at least one photo' }); return }
    }
    if (step === 2) fields = ['price']
    const ok = fields.length === 0 || await trigger(fields)
    if (ok) setStep((s) => s + 1)
  }

  const selectedCategory = categories.find((c) => c.id === watched.categoryId)

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

      {/* Progress */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i <= step ? 'bg-primary' : 'bg-muted'
            )} />
            <p className={cn('text-xs mt-1 font-medium', i === step ? 'text-primary' : 'text-muted-foreground')}>
              {s}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit((d) => createMutation.mutate(d))}>
        {/* Step 0 — Details */}
        {step === 0 && (
          <div className="rounded-xl border bg-card p-6 space-y-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title *</label>
              <input
                {...register('title')}
                className="input-field"
                placeholder="e.g., MacBook Air M2 256GB Space Grey"
                autoFocus
              />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">{watched.title?.length ?? 0}/100</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Description *</label>
              <textarea
                {...register('description')}
                rows={5}
                className="input-field resize-none"
                placeholder="Describe your item — include any accessories, box, receipt, reason for selling…"
              />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">{watched.description?.length ?? 0}/2000</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category *</label>
                <select {...register('categoryId')} className="input-field h-10">
                  <option value="">Select…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-xs text-destructive mt-1">{errors.categoryId.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">City *</label>
                <input {...register('city')} className="input-field h-10" placeholder="Mumbai" />
                {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Locality (optional)</label>
              <input {...register('locality')} className="input-field" placeholder="Andheri West, Koramangala…" />
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Condition *</label>
              <div className="space-y-2">
                {CONDITIONS.map(({ value, label, desc }) => (
                  <label
                    key={value}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                      watched.condition === value ? 'border-primary bg-accent/50' : 'hover:border-muted-foreground/40'
                    )}
                  >
                    <input
                      type="radio"
                      value={value}
                      {...register('condition')}
                      className="accent-primary"
                    />
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

        {/* Step 1 — Photos */}
        {step === 1 && (
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div>
              <h2 className="font-semibold mb-1">Add Photos</h2>
              <p className="text-sm text-muted-foreground">Good photos get more buyers. Add up to 10 images.</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className={cn('relative aspect-square rounded-xl overflow-hidden border-2', i === 0 ? 'border-primary' : 'border-transparent')}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold text-center py-0.5">
                      COVER
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {images.length < 10 && (
                <label className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-accent/30 transition-all">
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                  {uploading ? (
                    <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-7 w-7 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground text-center px-2">
                        {images.length === 0 ? 'Add photos' : 'Add more'}
                      </span>
                    </>
                  )}
                </label>
              )}
            </div>

            {images.length === 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
                <ImageIcon className="h-4 w-4 shrink-0" />
                At least 1 photo is required to create a listing.
              </div>
            )}

            {/* Video upload */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-1">Video (optional)</h3>
              <p className="text-xs text-muted-foreground mb-3">Upload a short demo video — max 50MB. Great for electronics, vehicles, etc.</p>

              {video ? (
                <div className="relative rounded-xl overflow-hidden bg-black">
                  <video src={video} controls className="w-full max-h-48 object-contain" />
                  <button
                    type="button"
                    onClick={() => setVideo('')}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3 p-4 border-2 border-dashed border-muted-foreground/30 rounded-xl cursor-pointer hover:border-primary hover:bg-accent/20 transition-all">
                  <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploadingVideo} className="hidden" />
                  {uploadingVideo ? (
                    <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : (
                    <Video className="h-6 w-6 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{uploadingVideo ? 'Uploading video…' : 'Upload a video'}</p>
                    <p className="text-xs text-muted-foreground">MP4, MOV, AVI · Max 50MB</p>
                  </div>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Step 2 — Pricing */}
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
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  className="input-field pl-8 text-lg font-semibold"
                  placeholder="0"
                  autoFocus
                />
              </div>
              {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
            </div>

            <label className={cn(
              'flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all',
              watched.negotiable ? 'border-primary bg-accent/40' : 'hover:border-muted-foreground/40'
            )}>
              <input type="checkbox" {...register('negotiable')} className="h-4 w-4 accent-primary" />
              <div>
                <p className="font-medium text-sm">Open to offers</p>
                <p className="text-xs text-muted-foreground">Buyers can send you a lower price offer</p>
              </div>
            </label>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground text-xs mb-1">Category</p>
                <p className="font-medium">{selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : '—'}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground text-xs mb-1">Condition</p>
                <p className="font-medium capitalize">{watched.condition?.replace('-', ' ') || '—'}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground text-xs mb-1">Location</p>
                <p className="font-medium">{[watched.city, watched.locality].filter(Boolean).join(', ') || '—'}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground text-xs mb-1">Photos</p>
                <p className="font-medium">{images.length} photo{images.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground text-xs mb-1">Video</p>
                <p className="font-medium">{video ? '1 video' : 'None'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
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
            <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {createMutation.isPending ? 'Publishing…' : 'Publish Listing'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
