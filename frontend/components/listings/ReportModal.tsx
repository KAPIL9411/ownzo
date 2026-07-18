'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ApiService } from '@/frontend/services/api.service'
import { useToast } from '@/frontend/components/ui/toast'
import { Button } from '@/frontend/components/ui/button'
import { Flag, X } from 'lucide-react'

const REASONS = [
  'Spam or misleading',
  'Counterfeit or fake item',
  'Prohibited item',
  'Scam or fraud',
  'Wrong category',
  'Already sold',
  'Inappropriate content',
  'Other',
]

interface ReportModalProps {
  type: 'listing' | 'user'
  targetId: string
  targetName?: string
  open: boolean
  onClose: () => void
}

export function ReportModal({ type, targetId, targetName, open, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: () => ApiService.post('/report', { type, targetId, reason, description }),
    onSuccess: () => {
      toast({ type: 'success', title: 'Report submitted', description: 'Our team will review it shortly.' })
      onClose()
    },
    onError: (err: any) => {
      toast({ type: 'error', title: err?.message ?? 'Failed to submit report' })
    },
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b">
          <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center">
            <Flag className="h-4 w-4 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">Report {type === 'listing' ? 'Listing' : 'User'}</p>
            {targetName && <p className="text-xs text-muted-foreground truncate">{targetName}</p>}
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">What's the issue?</p>
            <div className="grid grid-cols-2 gap-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium text-left transition-all ${
                    reason === r
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Additional details (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the issue in more detail…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none outline-none focus:border-gray-400 transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!reason || mutation.isPending}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {mutation.isPending ? 'Submitting…' : 'Submit Report'}
          </Button>
        </div>
      </div>
    </div>
  )
}
