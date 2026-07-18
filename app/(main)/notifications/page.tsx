'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { NotificationService } from '@/frontend/services/notification.service'
import { Button } from '@/frontend/components/ui/button'
import { EmptyState } from '@/frontend/components/ui/empty-state'
import { useToast } from '@/frontend/components/ui/toast'
import { formatRelativeTime } from '@/frontend/lib/utils'
import {
  Bell, CheckCheck, MessageCircle, Tag, Star, Package, Info, ShoppingBag,
} from 'lucide-react'
import { cn } from '@/frontend/lib/utils'
import Link from 'next/link'

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  message: <MessageCircle className="h-4 w-4 text-blue-500" />,
  offer: <Tag className="h-4 w-4 text-purple-500" />,
  review: <Star className="h-4 w-4 text-yellow-500" />,
  listing: <ShoppingBag className="h-4 w-4 text-green-500" />,
  system: <Info className="h-4 w-4 text-gray-500" />,
}

const NOTIF_COLORS: Record<string, string> = {
  message: 'bg-blue-100',
  offer: 'bg-purple-100',
  review: 'bg-yellow-100',
  listing: 'bg-green-100',
  system: 'bg-gray-100',
}

const NOTIF_LINKS: Record<string, (id?: string) => string> = {
  message: (id) => `/chat`,
  offer: (id) => `/listings/${id ?? ''}`,
  review: (id) => `/profile`,
  listing: (id) => `/listings/${id ?? ''}`,
  system: () => '/',
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => NotificationService.getNotifications(),
    refetchInterval: 30000,
  })

  const markOneMutation = useMutation({
    mutationFn: (id: string) => NotificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllMutation = useMutation({
    mutationFn: () => NotificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
      toast({ type: 'success', title: 'All notifications marked as read' })
    },
  })

  const notifications = data?.data?.notifications ?? []
  const unreadCount = data?.data?.unreadCount ?? 0

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="h-6 min-w-6 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? 'Loading…' : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-1.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-xl border animate-pulse">
              <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You're all caught up!"
          description="Notifications about your listings, chats, and offers will appear here."
        />
      ) : (
        <div className="space-y-1.5">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              href={NOTIF_LINKS[notif.type]?.(notif.referenceId) ?? '/'}
              onClick={() => { if (!notif.read) markOneMutation.mutate(notif.id) }}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border transition-all hover:border-primary/30',
                !notif.read ? 'bg-primary/5 border-primary/20' : 'bg-card hover:bg-accent/30'
              )}
            >
              {/* Icon */}
              <div className={cn(
                'h-9 w-9 rounded-full flex items-center justify-center shrink-0',
                NOTIF_COLORS[notif.type] ?? 'bg-muted'
              )}>
                {NOTIF_ICONS[notif.type] ?? <Bell className="h-4 w-4 text-muted-foreground" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm leading-snug', !notif.read && 'font-semibold')}>
                  {notif.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5">{formatRelativeTime(notif.createdAt)}</p>
              </div>

              {/* Unread dot */}
              {!notif.read && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 mt-1" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
