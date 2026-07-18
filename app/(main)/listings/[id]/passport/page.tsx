'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { ApiService } from '@/frontend/services/api.service'
import { ListingService } from '@/frontend/services/listing.service'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/frontend/components/ui/toast'
import { Button } from '@/frontend/components/ui/button'
import { formatPrice, formatDate } from '@/frontend/lib/utils'
import {
  ShieldCheck, FileText, Wrench, Calendar, DollarSign,
  Plus, Save, ArrowLeft, Package, Loader2, CheckCircle,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/frontend/lib/utils'

export default function ProductPassportPage() {
  const { id: listingId } = useParams() as { id: string }
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [showAddService, setShowAddService] = useState(false)
  const [serviceForm, setServiceForm] = useState({
    date: '', description: '', cost: '', serviceProvider: '',
  })

  const { data: listingData } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => ListingService.getListingById(listingId),
  })
  const listing = listingData?.data

  const { data: passportData, isLoading } = useQuery({
    queryKey: ['product-passport', listingId],
    queryFn: () => ApiService.get<any>(`/product-passport?listingId=${listingId}`),
  })
  const passport = passportData

  const [form, setForm] = useState({
    invoiceURL:        passport?.invoiceURL        ?? '',
    warrantyTill:      passport?.warrantyTill?.seconds
      ? new Date(passport.warrantyTill.seconds * 1000).toISOString().split('T')[0]
      : '',
    ownershipDuration: passport?.ownershipDuration ?? '',
    purchaseDate:      passport?.purchaseDate?.seconds
      ? new Date(passport.purchaseDate.seconds * 1000).toISOString().split('T')[0]
      : '',
    originalPrice:     passport?.originalPrice     ?? '',
  })

  const saveMut = useMutation({
    mutationFn: () => ApiService.post('/product-passport', {
      listingId,
      ...form,
      ownershipDuration: form.ownershipDuration ? Number(form.ownershipDuration) : undefined,
      originalPrice:     form.originalPrice     ? Number(form.originalPrice)     : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-passport', listingId] })
      toast({ type: 'success', title: 'Product passport saved!' })
    },
    onError: () => toast({ type: 'error', title: 'Failed to save passport' }),
  })

  const addServiceMut = useMutation({
    mutationFn: () => ApiService.post('/product-passport/service-record', {
      passportId: passport?.id,
      ...serviceForm,
      cost: serviceForm.cost ? Number(serviceForm.cost) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-passport', listingId] })
      toast({ type: 'success', title: 'Service record added' })
      setShowAddService(false)
      setServiceForm({ date: '', description: '', cost: '', serviceProvider: '' })
    },
    onError: () => toast({ type: 'error', title: 'Failed to add service record' }),
  })

  const isOwner = user?.id === listing?.sellerId

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/listings/${listingId}`}><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h1 className="section-title">Product Passport</h1>
          </div>
          <p className="text-sm text-muted-foreground truncate">{listing?.title}</p>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-xl border bg-primary/5 border-primary/20 p-4">
        <p className="text-sm font-semibold text-primary mb-1">What is a Product Passport?</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          A product passport gives buyers full transparency — warranty, purchase history, service records and original invoice.
          It builds trust and helps your listing sell faster.
        </p>
      </div>

      {/* Listing preview */}
      {listing && (
        <div className="flex gap-3 p-4 rounded-xl border bg-card">
          <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted shrink-0">
            {listing.images?.[0]
              ? <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
              : <Package className="h-8 w-8 text-muted-foreground/30 m-3" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm line-clamp-1">{listing.title}</p>
            <p className="text-primary font-bold">{formatPrice(listing.price)}</p>
          </div>
          {passport && (
            <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
              <CheckCircle className="h-4 w-4" /> Passport active
            </div>
          )}
        </div>
      )}

      {/* Main form — only owner can edit */}
      {isOwner ? (
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h2 className="font-bold text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Ownership Details
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Purchase Date</label>
              <input type="date" value={form.purchaseDate}
                onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))}
                className="input-field h-10" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Original Price (₹)</label>
              <input type="number" value={form.originalPrice} placeholder="e.g., 45000"
                onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                className="input-field h-10" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Ownership Duration (months)</label>
              <input type="number" value={form.ownershipDuration} placeholder="e.g., 18"
                onChange={e => setForm(f => ({ ...f, ownershipDuration: e.target.value }))}
                className="input-field h-10" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Warranty Valid Till</label>
              <input type="date" value={form.warrantyTill}
                onChange={e => setForm(f => ({ ...f, warrantyTill: e.target.value }))}
                className="input-field h-10" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Invoice / Receipt URL</label>
            <input type="url" value={form.invoiceURL} placeholder="https://…"
              onChange={e => setForm(f => ({ ...f, invoiceURL: e.target.value }))}
              className="input-field" />
            <p className="text-xs text-muted-foreground mt-1">Upload your invoice to Google Drive/Dropbox and paste the link</p>
          </div>

          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saveMut.isPending ? 'Saving…' : passport ? 'Update Passport' : 'Create Passport'}
          </Button>
        </div>
      ) : passport ? (
        /* Read-only view for non-owners */
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Ownership Details
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {passport.purchaseDate && (
              <div><p className="text-xs text-muted-foreground">Purchase Date</p>
                <p className="font-semibold">{formatDate(new Date(passport.purchaseDate.seconds * 1000))}</p></div>
            )}
            {passport.originalPrice && (
              <div><p className="text-xs text-muted-foreground">Original Price</p>
                <p className="font-semibold">{formatPrice(passport.originalPrice)}</p></div>
            )}
            {passport.ownershipDuration && (
              <div><p className="text-xs text-muted-foreground">Owned For</p>
                <p className="font-semibold">{passport.ownershipDuration} months</p></div>
            )}
            {passport.warrantyTill && (
              <div><p className="text-xs text-muted-foreground">Warranty Till</p>
                <p className="font-semibold">{formatDate(new Date(passport.warrantyTill.seconds * 1000))}</p></div>
            )}
            {passport.invoiceURL && (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Invoice</p>
                <a href={passport.invoiceURL} target="_blank" rel="noopener noreferrer"
                  className="text-primary text-sm font-semibold hover:underline">
                  View Invoice →
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-muted/30 p-10 text-center">
          <ShieldCheck className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">No product passport yet</p>
          <p className="text-xs text-muted-foreground mt-1">The seller hasn't added one for this listing</p>
        </div>
      )}

      {/* Service history */}
      {(passport?.serviceHistory?.length > 0 || isOwner) && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" /> Service History
            </h2>
            {isOwner && passport && (
              <Button variant="outline" size="sm" onClick={() => setShowAddService(!showAddService)}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Record
              </Button>
            )}
          </div>

          {/* Add service record form */}
          {showAddService && (
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-semibold">New Service Record</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                  <input type="date" value={serviceForm.date}
                    onChange={e => setServiceForm(f => ({ ...f, date: e.target.value }))}
                    className="input-field h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Cost (₹)</label>
                  <input type="number" value={serviceForm.cost} placeholder="Optional"
                    onChange={e => setServiceForm(f => ({ ...f, cost: e.target.value }))}
                    className="input-field h-9 text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Description *</label>
                  <input value={serviceForm.description} placeholder="e.g., Battery replacement"
                    onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))}
                    className="input-field h-9 text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Service Provider</label>
                  <input value={serviceForm.serviceProvider} placeholder="e.g., Apple Authorised Service"
                    onChange={e => setServiceForm(f => ({ ...f, serviceProvider: e.target.value }))}
                    className="input-field h-9 text-sm" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => addServiceMut.mutate()}
                  disabled={!serviceForm.description || addServiceMut.isPending}>
                  {addServiceMut.isPending ? 'Adding…' : 'Add'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddService(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Service list */}
          {(passport?.serviceHistory ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No service records yet.</p>
          ) : (
            <div className="space-y-3">
              {(passport.serviceHistory as any[]).map((rec: any, i: number) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-muted/30 border">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Wrench className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{rec.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-0.5">
                      {rec.date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(new Date(rec.date.seconds * 1000))}</span>}
                      {rec.serviceProvider && <span>{rec.serviceProvider}</span>}
                      {rec.cost && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{formatPrice(rec.cost)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
