'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getMessagingInstance } from '@/frontend/lib/firebase/config'
import { getToken, onMessage, Messaging } from 'firebase/messaging'

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? ''

export interface PushNotification {
  title: string
  body:  string
  icon?: string
  url?:  string
}

export function usePushNotifications(onNotification?: (n: PushNotification) => void) {
  const [token,      setToken]  = useState<string | null>(null)
  const [permission, setPerm]   = useState<NotificationPermission | 'unknown'>('unknown')
  const [error,      setError]  = useState<string | null>(null)
  const unsubRef = useRef<(() => void) | null>(null)

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setError('Notifications not supported')
      return
    }

    try {
      const perm = await Notification.requestPermission()
      setPerm(perm)
      if (perm !== 'granted') return

      const msg = await getMessagingInstance()
      if (!msg) { setError('Push messaging not supported in this browser'); return }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')

      const fcmToken = await getToken(msg, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      })

      if (fcmToken) {
        setToken(fcmToken)
        // Persist to backend — non-critical, swallow errors
        fetch('/api/notifications/token', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ token: fcmToken }),
        }).catch(() => {})
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to get push token')
    }
  }, [])

  // Listen for foreground messages
  useEffect(() => {
    if (!onNotification) return
    let cancelled = false

    getMessagingInstance().then((msg) => {
      if (!msg || cancelled) return
      const unsub = onMessage(msg, (payload) => {
        const { title, body, icon } = payload.notification ?? {}
        onNotification({
          title: title ?? 'Ownzo',
          body:  body  ?? '',
          icon,
          url:   payload.data?.url,
        })
      })
      unsubRef.current = unsub
    })

    return () => {
      cancelled = true
      unsubRef.current?.()
      unsubRef.current = null
    }
  }, [onNotification])

  // If already granted, init silently on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    const perm = Notification.permission as NotificationPermission
    setPerm(perm)
    if (perm === 'granted') requestPermission()
  }, [requestPermission])

  return { token, permission, error, requestPermission }
}
