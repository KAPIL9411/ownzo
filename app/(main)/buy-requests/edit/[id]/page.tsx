'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BuyRequestService } from '@/frontend/services/buyrequest.service'
import { CategoryService } from '@/frontend/services/category.service'
import { Button } from '@/frontend/components/ui/button'
import { useToast } from '@/frontend/components/ui/toast'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  title:       z.string().min(5).max(100),
  description: z.string().min(20).max(1000),
  categoryId:  z.string().min(1, 'Select a category'),
  budget:      z.number({ invalid_type_error: 'Enter your budget' }).positive(),
  negotiable:  z.boolean(),
  city:        z.string().min(2),
  locality:    z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function EditBuyRequestPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: allData, isLoading: loadingReq } = useQuery({
    queryKey: ['buy-request', id],
    queryFn: async () => {
      const res = await BuyRequestService.getBuyRequests({ limit: 1 })
      // Fetch from API — in prod this would be a single getBuyRequestById
      const all = res.data?.data ?? []
      return all.find((r: any) => r.id === id) ?? null
    },
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => CategoryService.getCategories(),
  })
  const categories = categoriesData?.data ?? []

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { negotiable: true },
  })

  // Pre-fill form when data loads
  useEffect(() => {
    if (allData) {
      reset({
        title:       allData.title,
        description: allData.description,
        categoryId:  allData.categoryId,
        budget:      allData.budget,
        negotiable:  allData.negotiable,
        city:        allData.city,
        locality:    allData.locality ?? '',
      })
    }
  }, [allData, reset])

  const updateMut = useMutation({
    mutationFn: (data: FormData) => BuyRequestService.updateBuyRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-buy-requests'] })
      toast({ type: 'success', title: 'Buy request updated!' })
      router.push('/buy-requests/my')
    },
    onError: () => toast({ type: 'error', title: 'Failed to update' }),
  })

  const watched = watch()

  if (loadingReq) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!allData) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <p className="text-muted-foreground">Buy request not found</p>
        <Button asChild className="mt-4"><Link href="/buy-requests/my">Back to My Requests</Link></Button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/buy-requests/my"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="section-title">Edit Buy Request</h1>
          <p className="text-sm text-muted-foreground">Update what you're looking for</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(d => updateMut.mutate(d))} className="rounded-xl border bg-card p-6 space-y-5">
        <div>
          <label className="text-sm font-medium mb-1.5 block">What are you looking for? *</label>
          <input {...register('title')} className="input-field" />
          {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Description *</label>
          <textarea {...register('description')} rows={4} className="input-field resize-none" />
          {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
          <p className="text-xs text-muted-foreground mt-1">{watched.description?.length ?? 0}/1000</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Category *</label>
            <select {...register('categoryId')} className="input-field h-10">
              <option value="">Select…</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-destructive mt-1">{errors.categoryId.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">City *</label>
            <input {...register('city')} className="input-field h-10" />
            {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Locality (optional)</label>
          <input {...register('locality')} className="input-field" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Budget (₹) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
            <input type="number" {...register('budget', { valueAsNumber: true })} className="input-field pl-8 font-semibold" />
          </div>
          {errors.budget && <p className="text-xs text-destructive mt-1">{errors.budget.message}</p>}
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" {...register('negotiable')} className="h-4 w-4 accent-primary" />
          <p className="text-sm font-medium">Open to negotiation</p>
        </label>
        <Button type="submit" className="w-full" disabled={updateMut.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateMut.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}
