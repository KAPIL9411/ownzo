'use client'

import { useState, useEffect, useRef } from 'react'
import { collection, query, where, orderBy, onSnapshot, Firestore } from 'firebase/firestore'
import { db } from '@/frontend/lib/firebase/config'
import { Message } from '@/shared/types'

/**
 * Subscribes to a Firestore messages collection in real-time using onSnapshot.
 * Falls back to empty array if chatId is null or db is not ready.
 */
export function useRealtimeMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading]   = useState(false)
  const unsubRef                = useRef<(() => void) | null>(null)

  useEffect(() => {
    // Cleanup previous subscription
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }
    if (!chatId || !db) { setMessages([]); return }

    setLoading(true)

    const messagesRef = collection(db as Firestore, 'messages')
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    )

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const msgs: Message[] = snapshot.docs.map((doc) => {
          const d = doc.data()
          return {
            id:        doc.id,
            chatId:    d.chatId,
            senderId:  d.senderId,
            message:   d.message,
            type:      d.type ?? 'text',
            imageUrl:  d.imageUrl,
            read:      d.read ?? false,
            createdAt: d.createdAt?.toDate?.() ?? new Date(d.createdAt ?? Date.now()),
          } as Message
        })
        setMessages(msgs)
        setLoading(false)
      },
      (err) => {
        console.error('Realtime messages error:', err)
        setLoading(false)
      }
    )

    unsubRef.current = unsub
    return () => { unsub(); unsubRef.current = null }
  }, [chatId])

  return { messages, loading }
}

/**
 * Subscribes to a user's chat list in real-time.
 * Merges buyer-side and seller-side chats into a single sorted list.
 */
export function useRealtimeChats(userId: string | undefined) {
  const [chats, setChats]     = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const unsub1Ref             = useRef<(() => void) | null>(null)
  const unsub2Ref             = useRef<(() => void) | null>(null)
  // Keep two halves separately so we can merge on every update
  const buyerChatsRef  = useRef<any[]>([])
  const sellerChatsRef = useRef<any[]>([])

  function mergeAndSet() {
    const all = [...buyerChatsRef.current, ...sellerChatsRef.current]
    // Deduplicate by id, sort by updatedAt desc
    const seen = new Set<string>()
    const merged = all
      .filter((c) => { if (seen.has(c.id)) return false; seen.add(c.id); return true })
      .sort((a, b) => {
        const at = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt ?? 0)
        const bt = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt ?? 0)
        return bt.getTime() - at.getTime()
      })
    setChats(merged)
  }

  function docToChat(doc: any) {
    const d = doc.data()
    return {
      id:            doc.id,
      listingId:     d.listingId,
      buyRequestId:  d.buyRequestId,
      buyerId:       d.buyerId,
      sellerId:      d.sellerId,
      lastMessage:   d.lastMessage,
      lastMessageAt: d.lastMessageAt?.toDate?.() ?? null,
      unreadCount:   d.unreadCount ?? 0,
      buyer:         d.buyer,
      seller:        d.seller,
      createdAt:     d.createdAt?.toDate?.() ?? new Date(),
      updatedAt:     d.updatedAt?.toDate?.() ?? new Date(),
    }
  }

  useEffect(() => {
    // Cleanup
    unsub1Ref.current?.(); unsub1Ref.current = null
    unsub2Ref.current?.(); unsub2Ref.current = null
    buyerChatsRef.current  = []
    sellerChatsRef.current = []

    if (!userId || !db) { setChats([]); return }

    setLoading(true)
    let ready1 = false, ready2 = false

    const chatsRef = collection(db as Firestore, 'chats')

    // Subscription 1 — chats where user is buyer
    const q1 = query(chatsRef, where('buyerId',  '==', userId), orderBy('updatedAt', 'desc'))
    unsub1Ref.current = onSnapshot(q1, (snap) => {
      buyerChatsRef.current = snap.docs.map(docToChat)
      ready1 = true
      if (ready1 && ready2) { setLoading(false); mergeAndSet() }
    }, () => { ready1 = true; if (ready1 && ready2) setLoading(false) })

    // Subscription 2 — chats where user is seller
    const q2 = query(chatsRef, where('sellerId', '==', userId), orderBy('updatedAt', 'desc'))
    unsub2Ref.current = onSnapshot(q2, (snap) => {
      sellerChatsRef.current = snap.docs.map(docToChat)
      ready2 = true
      if (ready1 && ready2) { setLoading(false); mergeAndSet() }
    }, () => { ready2 = true; if (ready1 && ready2) setLoading(false) })

    return () => {
      unsub1Ref.current?.(); unsub1Ref.current = null
      unsub2Ref.current?.(); unsub2Ref.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return { chats, loading }
}
