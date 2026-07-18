'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthService } from '@/frontend/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/frontend/components/ui/button'
import { useToast } from '@/frontend/components/ui/toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/frontend/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, User } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(60),
  bio: z.string().max(200, 'Max 200 characters').optional(),
  phone: z.string().max(15).optional(),
  city: z.string().max(80).optional(),
  locality: z.string().max(80).optional(),
})
type FormData = z.infer<typeof schema>

export default function EditProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const watched = watch()

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? '',
        bio: user.bio ?? '',
        phone: user.phone ?? user.phoneNumber ?? '',
        city: user.city ?? user.location?.city ?? '',
        locality: user.location?.locality ?? '',
      })
    }
  }, [user, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) => AuthService.updateProfile({
      name: data.name,
      bio: data.bio,
      phone: data.phone,
      location: data.city ? { city: data.city, locality: data.locality } : undefined,
    }),
    onSuccess: (res) => {
      if (res.data) {
        setUser(res.data)
      }
      toast({ type: 'success', title: 'Profile updated!' })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      router.push('/profile')
    },
    onError: () => toast({ type: 'error', title: 'Failed to update profile' }),
  })

  if (!user) return null

  const initials = user.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="section-title">Edit Profile</h1>
          <p className="text-sm text-muted-foreground">Update your personal information</p>
        </div>
      </div>

      {/* Avatar preview */}
      <div className="flex flex-col items-center gap-3 py-4">
        <Avatar className="h-20 w-20 text-2xl">
          <AvatarImage src={user.photoURL} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="font-semibold">{watched.name || user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <p className="text-xs text-muted-foreground">Profile photo is synced from your Google account</p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="rounded-xl border bg-card p-6 space-y-5">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Display Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input {...register('name')} className="input-field pl-9" placeholder="Your name" />
          </div>
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Bio</label>
          <textarea
            {...register('bio')}
            rows={3}
            className="input-field resize-none"
            placeholder="Tell buyers a bit about yourself…"
          />
          <p className="text-xs text-muted-foreground mt-1">{watched.bio?.length ?? 0}/200</p>
          {errors.bio && <p className="text-xs text-destructive mt-1">{errors.bio.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
          <input {...register('phone')} className="input-field" placeholder="+91 98765 43210" type="tel" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">City</label>
            <input {...register('city')} className="input-field" placeholder="Mumbai" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Locality</label>
            <input {...register('locality')} className="input-field" placeholder="Andheri West" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1" disabled={mutation.isPending || !isDirty}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {mutation.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/profile')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
