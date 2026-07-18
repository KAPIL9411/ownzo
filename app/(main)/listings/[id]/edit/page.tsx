'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ListingService } from '@/frontend/services/listing.service'
import { CategoryService } from '@/frontend/services/category.service'
import { ApiService } from '@/frontend/services/api.service'
import { Button } from '@/frontend/components/ui/button'
import { useToast } from '@/frontend/components/ui/toast'
import { useRouter, useParams } from 'next/navigation'
import { Upload, X, Trash2, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

const schema = z.object({
  title: z.string().min(5, 'Min 5 characters').max(100),
  description: z.string().min(20, 'Min 20 characters').max(2000),
  categoryId: z.string().min(1, 'Select a category'),
  price: z.number({ invalid_type_error: 'Enter a valid price' }).positive(),
  negotiable: z.boolean(),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']),
  city: z.string().min(2, 'Enter city'),
  locality: z.string().optional(),
  status: z.enum(['active', 'sold', 'deleted']).optional(),
})

type FormData = z.infer<typeof schema>

export default function EditListingPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const listingId = params.id as string
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => ListingService.getListingById(listingId),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => CategoryService.getCategories(),
  })

  const listing = data?.data
  const categories = categoriesData?.data ?? []

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (listing) {
      reset({
        title: listing.title,
        description: listing.description,
        categoryId: listing.categoryId,
        price: listing.price,
        negotiable: listing.negotiable,
        condition: listing.condition,
        city: listing.city,
        locality: listing.locality ?? '',
        status: listing.status as any,
      })
      setImages(listing.images ?? [])
    }
  }, [listing, reset])

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => ListingService.updateListing(listingId, { ...data, images }),
    onSuccess: () => {
      toast({ type: 'success', title: 'Listing updated!' })
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      router.push(`/listings/${listingId}`)
    },
    onError: () => toast({ type: 'error', title: 'Failed to update listing' }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => ListingService.deleteListing(listingId),
    onSuccess: () => {
      toast({ type: 'success', title: 'Listing deleted' })
      router.push('/profile')
    },
  })

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    try {
      const results = await Promise.all(Array.from(files).map((f) => ApiService.uploadFile(f, 'image')))
      setImages((prev) => [...prev, ...results.map((r) => r.data.url)])
    } catch {
      toast({ type: 'error', title: 'Image upload failed' })
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 bg-muted rounded w-1/3" />
      {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded" />)}
    </div>
  )

  if (listing?.sellerId !== user?.id) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground">You don't have permission to edit this listing.</p>
      <Button className="mt-4" asChild><Link href="/listings">Back to Listings</Link></Button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/listings/${listingId}`}><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="section-title">Edit Listing</h1>
          <p className="text-sm text-muted-foreground">Update your listing details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Basic Details</h2>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Title *</label>
            <input {...register('title')} className="input-field" placeholder="e.g., iPhone 13 Pro Max 256GB" />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Description *</label>
            <textarea {...register('description')} rows={4} className="input-field resize-none" placeholder="Describe your item's condition, features, reason for selling…" />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
          </div>

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
              <label className="text-sm font-medium mb-1.5 block">Condition *</label>
              <select {...register('condition')} className="input-field h-10">
                {[['new','New'],['like-new','Like New'],['good','Good'],['fair','Fair'],['poor','Poor']].map(([v,l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Price (₹) *</label>
              <input type="number" {...register('price', { valueAsNumber: true })} className="input-field" placeholder="5000" />
              {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
            </div>
            <div className="flex items-center gap-3 pt-7">
              <input type="checkbox" id="negotiable" {...register('negotiable')} className="h-4 w-4 accent-primary" />
              <label htmlFor="negotiable" className="text-sm font-medium">Negotiable</label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">City *</label>
              <input {...register('city')} className="input-field" placeholder="Mumbai" />
              {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Locality</label>
              <input {...register('locality')} className="input-field" placeholder="Andheri West" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Status</label>
            <select {...register('status')} className="input-field h-10">
              <option value="active">Active</option>
              <option value="sold">Mark as Sold</option>
            </select>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Photos</h2>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < 10 && (
              <label className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-accent transition-colors">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                {uploading ? (
                  <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Add</span>
                  </>
                )}
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={updateMutation.isPending} className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/listings/${listingId}`)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            className="text-destructive border-destructive/40 hover:bg-destructive/10"
            onClick={() => { if (confirm('Delete this listing?')) deleteMutation.mutate() }}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
