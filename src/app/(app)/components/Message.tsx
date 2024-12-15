'use client'

import { useEffect, useState } from 'react'
import { Message, User } from '../api/db/schema'
import { supabaseClient } from '../api/db/supabase-client'
import { Input } from '@/components/ui/input'
import { useAuth } from '@clerk/nextjs'
import { createMessage } from '../api/queries/supabase/create-message'
import { getUserWithId } from '../api/queries/supabase/get-user'
import { getMessages } from '../api/queries/supabase/get-messages'

type MessageWithUser = Awaited<ReturnType<typeof getMessages>>[number]

export default function MessageComponent({
  initialMessages,
  penaId,
  userId,
}: {
  initialMessages: Awaited<ReturnType<typeof getMessages>>
  penaId: number
  userId: number
}) {
  const user = useAuth()
  const [messages, setMessages] = useState<MessageWithUser[]>(initialMessages)
  const [message, setMessage] = useState<string>('')

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
          const newMessage = payload.new as Message
          if (!newMessage.userId) throw new Error('Message user not found')
          const messageUser = await getUserWithId(newMessage.userId)
          setMessages((prevMessages) => [
            ...prevMessages,
            { messages: newMessage, users: messageUser },
          ])
        },
      )
      .subscribe()

    return () => {
      supabaseClient.removeChannel(channel)
    }
  }, [messages])

  function onSend() {
    if (!user.userId) throw new Error('User not found')
    createMessage(message, user.userId, penaId)
    setMessage('')
  }

  return (
    <>
      <div className="mt-5 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg w-2/3 text-2xl bg-${
              msg.users?.id === userId ? 'blue-800' : 'gray-600'
            } ${msg.users?.id === userId ? 'self-end' : 'self-start'}`}
          >
            {msg.users?.id !== userId && msg.users?.firstName} - {msg.messages.message}
          </div>
        ))}
        <Input
          type="text"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              onSend()
            }
          }}
          className="flex-[0.7] text-2xl"
        />
      </div>
    </>
  )
}
