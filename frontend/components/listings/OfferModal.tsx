'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { OfferService } from '@/frontend/services/offer.service'
import { Listing } from '@/shared/types'
import { formatPrice } from '@/frontend/lib/utils'
import { useToast } from '@/frontend/components/ui/toast'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/frontend/components/ui/dialog'
import { Button } from '@/frontend/components/ui/button'
import { Tag, TrendingDown } from 'lucide-react'

interface OfferModalProps {
  listing: Listing
  open: boolean
  onClose: () => void
}

export function OfferModal({ listing, open, onClose }: OfferModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [price, setPrice] = useState('')
  const [message, setMessage] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      OfferService.createOffer({
        listingId: listing.id,
        offerPrice: Number(price),
        message,
      }),
    onSuccess: () => {
      toast({ type: 'success', title: 'Offer sent!', description: 'The seller will review your offer.' })
      queryClient.invalidateQueries({ queryKey: ['offers'] })
      onClose()
    },
    onError: () => {
      toast({ type: 'error', title: 'Failed to send offer', description: 'Please try again.' })
    },
  })

  const suggestedPrices = [
    Math.round(listing.price * 0.9),
    Math.round(listing.price * 0.8),
    Math.round(listing.price * 0.7),
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            Make an Offer
          </DialogTitle>
          <DialogDescription>
            Listed at <span className="font-semibold text-foreground">{formatPrice(listing.price)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Suggested prices */}
          <div>
            <p className="text-sm font-medium mb-2">Quick select</p>
            <div className="flex gap-2">
              {suggestedPrices.map((p) => (
                <button
                  key={p}
                  onClick={() => setPrice(String(p))}
                  className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-colors
                    ${price === String(p) ? 'border-primary bg-accent text-primary' : 'hover:border-primary/50'}`}
                >
                  {formatPrice(p)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom price */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Your offer (₹)</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={String(listing.price)}
                min={1}
                max={listing.price}
                className="input-field pl-9"
              />
            </div>
            {price && Number(price) > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((1 - Number(price) / listing.price) * 100)}% below listed price
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="Hi, I'm interested in this item…"
              className="input-field resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!price || Number(price) <= 0 || mutation.isPending}
          >
            {mutation.isPending ? 'Sending…' : 'Send Offer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
