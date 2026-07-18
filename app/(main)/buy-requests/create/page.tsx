'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { BuyRequestService } from '@/frontend/services/buyrequest.service'
import { CategoryService } from '@/frontend/services/category.service'
import { Button } from '@/frontend/components/ui/button'
import { useToast } from '@/frontend/components/ui/toast'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Package } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  title: z.string().min(5, 'At least 5 characters').max(100),
  description: z.string().min(20, 'At least 20 characters').max(1000),
  categoryId: z.string().min(1, 'Select a category'),
  budget: z.number({ invalid_type_error: 'Enter your budget' }).positive(),
  negotiable: z.boolean(),
  city: z.string().min(2, 'Enter your city'),
  locality: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function CreateBuyRequestPage() {
  const router = useRouter()
  const { toast } = useToast()

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => CategoryService.getCategories(),
  })
  const categories = categoriesData?.data ?? []

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { negotiable: true },
  })

  const watched = watch()

  const mutation = useMutation({
    mutationFn: (data: FormData) => BuyRequestService.createBuyRequest(data),
    onSuccess: () => {
      toast({ type: 'success', title: 'Buy request posted!', description: 'Sellers will reach out to you.' })
      router.push('/buy-requests')
    },
    onError: () => toast({ type: 'error', title: 'Failed to post request' }),
  })

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/buy-requests"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="section-title">Post a Buy Request</h1>
          <p className="text-sm text-muted-foreground">Tell sellers exactly what you need</p>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Package className="h-5 w-5 text-primary" />
          <p className="font-semibold text-sm">How it works</p>
        </div>
        <ol className="space-y-1 text-sm text-muted-foreground list-none">
          <li className="flex gap-2"><span className="text-primary font-bold">1.</span> Describe what you're looking for</li>
          <li className="flex gap-2"><span className="text-primary font-bold">2.</span> Set your budget</li>
          <li className="flex gap-2"><span className="text-primary font-bold">3.</span> Sellers with matching items contact you</li>
          <li className="flex gap-2"><span className="text-primary font-bold">4.</span> Chat, negotiate, and meet up safely</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="rounded-xl border bg-card p-6 space-y-5">
        <div>
          <label className="text-sm font-medium mb-1.5 block">What are you looking for? *</label>
          <input
            {...register('title')}
            className="input-field"
            placeholder="e.g., iPhone 13 Pro, any color, 128GB+"
            autoFocus
          />
          {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Describe your requirements *</label>
          <textarea
            {...register('description')}
            rows={4}
            className="input-field resize-none"
            placeholder="Mention preferred brand, model, condition, accessories you need, any specific requirements…"
          />
          {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
          <p className="text-xs text-muted-foreground mt-1">{watched.description?.length ?? 0}/1000</p>
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
          <label className="text-sm font-medium mb-1.5 block">Your Budget (₹) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
            <input
              type="number"
              {...register('budget', { valueAsNumber: true })}
              className="input-field pl-8 text-lg font-semibold"
              placeholder="5000"
            />
          </div>
          {errors.budget && <p className="text-xs text-destructive mt-1">{errors.budget.message}</p>}
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" {...register('negotiable')} className="h-4 w-4 accent-primary" />
          <div>
            <p className="text-sm font-medium">Open to negotiation</p>
            <p className="text-xs text-muted-foreground">Sellers can propose a slightly different price</p>
          </div>
        </label>

        <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
          <CheckCircle className="h-4 w-4 mr-2" />
          {mutation.isPending ? 'Posting…' : 'Post Buy Request'}
        </Button>
      </form>
    </div>
  )
}
