'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminService } from '@/frontend/services/admin.service'
import { Button } from '@/frontend/components/ui/button'
import { Card } from '@/frontend/components/ui/card'
import { Badge } from '@/frontend/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/frontend/components/ui/dialog'
import { Textarea } from '@/frontend/components/ui/textarea'
import { Label } from '@/frontend/components/ui/label'
import { useToast } from '@/frontend/components/ui/toast'
import { CheckCircle, XCircle, Eye, User, MapPin, Calendar, IndianRupee } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminListingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedListing, setSelectedListing] = useState<any>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-pending-listings'],
    queryFn: async () => {
      console.log('[Admin Listings] Fetching pending listings...')
      const res = await AdminService.getPendingListings()
      console.log('[Admin Listings] Response:', res)
      console.log('[Admin Listings] Data:', res.data)
      console.log('[Admin Listings] Listings count:', res.data?.length || 0)
      return res.data || []
    },
  })

  const reviewMutation = useMutation({
    mutationFn: ({ listingId, action, reason }: { listingId: string; action: 'approve' | 'reject'; reason?: string }) =>
      AdminService.reviewListing(listingId, action, reason),
    onSuccess: (_, variables) => {
      toast({
        type: 'success',
        title: variables.action === 'approve' ? 'Listing Approved' : 'Listing Rejected',
        description: `The listing has been ${variables.action}d successfully.`,
      })
      queryClient.invalidateQueries({ queryKey: ['admin-pending-listings'] })
      setSelectedListing(null)
      setReviewAction(null)
      setRejectReason('')
    },
    onError: () => {
      toast({
        type: 'error',
        title: 'Action Failed',
        description: 'Failed to process the listing. Please try again.',
      })
    },
  })

  const handleReview = () => {
    if (!selectedListing || !reviewAction) return
    
    if (reviewAction === 'reject' && !rejectReason.trim()) {
      toast({
        type: 'warning',
        title: 'Reason Required',
        description: 'Please provide a reason for rejection.',
      })
      return
    }

    reviewMutation.mutate({
      listingId: selectedListing.id,
      action: reviewAction,
      reason: reviewAction === 'reject' ? rejectReason : undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card className="p-12 text-center border-destructive">
          <div className="flex flex-col items-center gap-4">
            <XCircle className="h-16 w-16 text-destructive" />
            <div>
              <h3 className="text-xl font-semibold">Error Loading Listings</h3>
              <p className="text-muted-foreground mt-1">
                {(error as any)?.message || 'Failed to fetch pending listings'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const listings = data || []

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pending Listings</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve or reject listings submitted for review
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {listings.length} Pending
        </Badge>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="text-xl font-semibold">All caught up!</h3>
              <p className="text-muted-foreground mt-1">
                No listings pending review at the moment.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing: any) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative aspect-video bg-muted">
                {listing.images?.[0] ? (
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No Image
                  </div>
                )}
                {listing.verificationStatus === 'pending' && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500">
                    Needs Verification
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {listing.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-lg font-bold text-primary">
                  <IndianRupee className="h-5 w-5" />
                  {listing.price.toLocaleString('en-IN')}
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{listing.seller?.name || 'Unknown Seller'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.city}{listing.locality ? `, ${listing.locality}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedListing(listing)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedListing && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedListing.title}</DialogTitle>
                <DialogDescription>
                  Review this listing and decide whether to approve or reject it
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Images */}
                {selectedListing.images?.length > 0 && (
                  <div>
                    <Label>Images</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {selectedListing.images.map((img: string, idx: number) => (
                        <div key={idx} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                          <Image src={img} alt={`Image ${idx + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Price</Label>
                    <p className="text-lg font-semibold">₹{selectedListing.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <Label>Condition</Label>
                    <p className="capitalize">{selectedListing.condition}</p>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <p>{selectedListing.city}{selectedListing.locality ? `, ${selectedListing.locality}` : ''}</p>
                  </div>
                  <div>
                    <Label>Negotiable</Label>
                    <p>{selectedListing.negotiable ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedListing.description}
                  </p>
                </div>

                {/* Seller Info */}
                <div className="border-t pt-4">
                  <Label>Seller Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><strong>Name:</strong> {selectedListing.seller?.name || 'Unknown'}</p>
                    <p><strong>Email:</strong> {selectedListing.seller?.email || 'N/A'}</p>
                    <p><strong>Trust Score:</strong> {selectedListing.seller?.trustScore || 0}/100</p>
                  </div>
                </div>

                {/* Trust Score */}
                {selectedListing.trustScore && (
                  <div>
                    <Label>Listing Trust Score</Label>
                    <p className="text-lg font-semibold">{selectedListing.trustScore}/100</p>
                  </div>
                )}

                {/* Reject Reason Input (shown when reviewing) */}
                {reviewAction === 'reject' && (
                  <div>
                    <Label htmlFor="reject-reason">Reason for Rejection *</Label>
                    <Textarea
                      id="reject-reason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Explain why this listing is being rejected..."
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                {!reviewAction ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedListing(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setReviewAction('reject')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => setReviewAction('approve')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setReviewAction(null)
                        setRejectReason('')
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleReview}
                      disabled={reviewMutation.isPending}
                      variant={reviewAction === 'approve' ? 'default' : 'destructive'}
                    >
                      {reviewMutation.isPending ? 'Processing...' : `Confirm ${reviewAction === 'approve' ? 'Approval' : 'Rejection'}`}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
