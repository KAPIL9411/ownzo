'use client'

import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { ChatService } from '@/frontend/services/chat.service'
import { Button } from '@/frontend/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/frontend/components/ui/avatar'
import { EmptyState } from '@/frontend/components/ui/empty-state'
import { useToast } from '@/frontend/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeMessages, useRealtimeChats } from '@/frontend/hooks/useRealtimeMessages'
import { formatRelativeTime } from '@/frontend/lib/utils'
import { Send, MessageCircle, ArrowLeft, MoreVertical } from 'lucide-react'
import { cn } from '@/frontend/lib/utils'
import Link from 'next/link'

export default function ChatPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    searchParams.get('chatId') ?? null
  )
  const [message, setMessage] = useState('')
  const [showList, setShowList] = useState(!searchParams.get('chatId'))

  // ── Real-time Firestore subscriptions ─────────────────────
  const { chats, loading: chatsLoading } = useRealtimeChats(user?.id)
  const { messages } = useRealtimeMessages(selectedChatId)

  const selectedChat = chats.find((c) => c.id === selectedChatId)

  const sendMutation = useMutation({
    mutationFn: ({ chatId, msg }: { chatId: string; msg: string }) =>
      ChatService.sendMessage(chatId, msg, 'text'),
    onSuccess: () => setMessage(''),
    onError: () => toast({ type: 'error', title: 'Failed to send message' }),
  })

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Open chat from URL param
  useEffect(() => {
    const id = searchParams.get('chatId')
    if (id) { setSelectedChatId(id); setShowList(false) }
  }, [searchParams])

  function handleSend() {
    if (!selectedChatId || !message.trim()) return
    sendMutation.mutate({ chatId: selectedChatId, msg: message.trim() })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function selectChat(chatId: string) {
    setSelectedChatId(chatId); setShowList(false)
  }

  const otherUser = (chat: typeof chats[0]) => {
    if (!user) return null
    return user.id === chat.buyerId ? chat.seller : chat.buyer
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex rounded-xl border bg-card overflow-hidden">
      {/* ── Chat list sidebar ──────────────────────────────── */}
      <div className={cn('w-full md:w-80 lg:w-96 border-r flex flex-col', !showList && 'hidden md:flex')}>
        <div className="p-4 border-b flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-semibold text-lg leading-none">Messages</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{chats.length} conversation{chats.length !== 1 ? 's' : ''}</p>
          </div>
          {/* Live indicator */}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatsLoading ? (
            <div className="space-y-1 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <EmptyState icon={MessageCircle} title="No messages yet" description="Start a conversation by chatting with a seller" className="py-12" />
          ) : (
            <div className="p-2 space-y-0.5">
              {chats.map((chat) => {
                const other = otherUser(chat)
                const isSelected = selectedChatId === chat.id
                const hasUnread = (chat.unreadCount ?? 0) > 0 && !isSelected
                return (
                  <button key={chat.id} onClick={() => selectChat(chat.id)}
                    className={cn('w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                      isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-accent/60'
                    )}>
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={other?.photoURL} />
                        <AvatarFallback>{other?.name?.[0] ?? '?'}</AvatarFallback>
                      </Avatar>
                      {hasUnread && <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary border-2 border-background" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn('text-sm font-medium truncate', hasUnread && 'font-semibold')}>{other?.name ?? 'User'}</span>
                        {chat.lastMessageAt && <span className="text-[10px] text-muted-foreground shrink-0">{formatRelativeTime(chat.lastMessageAt)}</span>}
                      </div>
                      <p className={cn('text-xs truncate', hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                        {chat.lastMessage ?? 'No messages yet'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Messages area ─────────────────────────────────── */}
      <div className={cn('flex-1 flex flex-col', showList && 'hidden md:flex')}>
        {!selectedChatId ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon={MessageCircle} title="Select a conversation" description="Choose a chat from the left to start messaging" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <button onClick={() => setShowList(true)} className="md:hidden p-1 -ml-1 rounded-lg hover:bg-accent">
                <ArrowLeft className="h-5 w-5" />
              </button>
              {(() => {
                const other = selectedChat ? otherUser(selectedChat) : null
                return (
                  <>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={other?.photoURL} />
                      <AvatarFallback>{other?.name?.[0] ?? '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{other?.name ?? 'User'}</p>
                      {selectedChat?.listingId && (
                        <Link href={`/listings/${selectedChat.listingId}`} className="text-xs text-primary hover:underline">
                          View listing →
                        </Link>
                      )}
                    </div>
                  </>
                )
              })()}
              <Button variant="ghost" size="icon-sm"><MoreVertical className="h-4 w-4" /></Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No messages yet. Say hello! 👋</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.id
                  const showAvatar = !isMe && (i === 0 || messages[i - 1]?.senderId !== msg.senderId)
                  return (
                    <div key={msg.id} className={cn('flex items-end gap-2', isMe && 'flex-row-reverse')}>
                      {!isMe && (
                        <Avatar className={cn('h-7 w-7 shrink-0', !showAvatar && 'invisible')}>
                          <AvatarImage src={selectedChat ? otherUser(selectedChat)?.photoURL : undefined} />
                          <AvatarFallback className="text-[10px]">{selectedChat ? otherUser(selectedChat)?.name?.[0] : '?'}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn('max-w-[72%] space-y-0.5', isMe && 'items-end flex flex-col')}>
                        <div className={cn('px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                          isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm'
                        )}>
                          {msg.message}
                        </div>
                        <span className="text-[10px] text-muted-foreground px-1">{formatRelativeTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-background">
              <div className="flex items-end gap-2 bg-muted rounded-2xl px-3 py-2">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  rows={1}
                  className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground max-h-24 py-1"
                />
                <Button size="icon-sm" onClick={handleSend} disabled={!message.trim() || sendMutation.isPending} className="rounded-xl shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-1.5">Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
