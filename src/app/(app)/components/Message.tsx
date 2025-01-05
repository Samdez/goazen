'use client'

import { useEffect, useState, useRef } from 'react'
import { Message, User } from '../api/db/schema'
import { supabaseClient } from '../api/db/supabase-client'
import { Input } from '@/components/ui/input'
import { useAuth } from '@clerk/nextjs'
import { createMessage } from '../api/queries/supabase/create-message'
import { getUserWithId } from '../api/queries/supabase/get-user'
import { getMessages } from '../api/queries/supabase/get-messages'
import { Send } from 'lucide-react'

type MessageWithUser = Awaited<ReturnType<typeof getMessages>>[number]

export default function MessageComponent({
  initialMessages,
  penaId,
  userId,
  isActive,
}: {
  initialMessages: Awaited<ReturnType<typeof getMessages>>
  penaId: number
  userId: number
  isActive: boolean
}) {
  const user = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<MessageWithUser[]>(initialMessages)
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabaseClient
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          try {
            const newMessage = payload.new as Message
            if (!newMessage.userId) throw new Error('Message user not found')
            const messageUser = await getUserWithId(newMessage.userId)
            setMessages((prevMessages) => [
              ...prevMessages,
              { messages: newMessage, users: messageUser },
            ])
          } catch (error) {
            console.error('Error processing real-time message:', error)
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time updates')
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to real-time updates')
          // Implement exponential backoff for reconnection
          const reconnect = (attempt = 0) => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000) // Max 30 second delay
            setTimeout(() => {
              console.log(`Attempting to reconnect (attempt ${attempt + 1})...`)
              channel.subscribe((newStatus) => {
                if (newStatus === 'CHANNEL_ERROR' && attempt < 5) {
                  reconnect(attempt + 1)
                }
              })
            }, delay)
          }
          reconnect()
        }
      })

    return () => {
      channel.unsubscribe()
      supabaseClient.removeChannel(channel)
    }
  }, [])

  function onSend() {
    if (!user.userId) throw new Error('User not found')
    createMessage(message, user.userId, penaId)
    setMessage('')
  }

  return (
    <div className="flex h-[80vh] flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="flex flex-col space-y-4">
          {messages.map((msg, i) => {
            const isCurrentUser = msg.users?.id === userId
            return (
              <div key={i} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="">
                    {!isCurrentUser && (
                      <div className="mb-1 text-sm font-medium w-full text-[#ee2244bc]">
                        {msg.users?.firstName}
                      </div>
                    )}
                    <div className="text-sm w-full break-words">{msg.messages.message}</div>
                  </div>
                  <div
                    className={`mt-1 text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}
                  >
                    {new Date(msg.messages.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t p-4 sticky bottom-0">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Écrivez votre message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                onSend()
              }
            }}
            className="flex-1 rounded-full border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={!isActive}
          />
          {isActive && (
            <button
              onClick={onSend}
              className="rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            ></button>
          )}
        </div>
      </div>
    </div>
  )
}
