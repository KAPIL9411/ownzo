'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ReviewService } from '@/frontend/services/review.service'
import { useToast } from '@/frontend/components/ui/toast'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/frontend/components/ui/dialog'
import { Button } from '@/frontend/components/ui/button'
import { Star } from 'lucide-react'

interface ReviewModalProps {
  listingId: string
  sellerId: string
  sellerName: string
  open: boolean
  onClose: () => void
}

export function ReviewModal({ listingId, sellerId, sellerName, open, onClose }: ReviewModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')

  const mutation = useMutation({
    mutationFn: () => ReviewService.createReview({ listingId, sellerId, rating, comment }),
    onSuccess: () => {
      toast({ type: 'success', title: 'Review submitted!', description: 'Thank you for your feedback.' })
      queryClient.invalidateQueries({ queryKey: ['reviews', sellerId] })
      onClose()
    },
    onError: () => {
      toast({ type: 'error', title: 'Failed to submit review' })
    },
  })

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
  const display = hovered || rating

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review {sellerName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Star rating */}
          <div>
            <p className="text-sm font-medium mb-3 text-center">How was your experience?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      star <= display ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm font-medium mt-2 text-primary">
              {labels[display]}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Your review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Share your experience with this seller…"
              className="input-field resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!comment.trim() || mutation.isPending}
          >
            {mutation.isPending ? 'Submitting…' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
