'use client'
import { useEffect, useRef, useState, MutableRefObject } from 'react'
import Chatmessage from './Chatmessage'
import { useSocket } from './SocketContext'
import { decryptMessage } from '../utils/encryption'

interface MessageData {
  message: string
  senderid: string
  username: string
  room: string
}

interface ChatMessageEntry {
  who: string
  message: string
  username: string
  time: number
}

interface ChatRoomProps {
  idRef: MutableRefObject<string>
  onMessageFromSender: (callback: (message: string) => void) => void
  username: string
}

export default function Chatroom({
  idRef,
  onMessageFromSender,
  username,
}: ChatRoomProps) {
  const { socket } = useSocket()
  const [messages, setMessages] = useState<ChatMessageEntry[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!socket) return

    const handleReceiveMessage = (data: MessageData) => {
      const decryptedMessage = decryptMessage(data.message)

      setMessages((prev) => [
        ...prev,
        {
          who: 'others',
          message: decryptedMessage,
          username: data.username,
          time: Date.now(),
        },
      ])
    }

    const handleSentMessage = (message: string) => {
      setMessages((prev) => [
        ...prev,
        { who: 'user', message, username, time: Date.now() },
      ])
    }

    socket.on('recieve_msg', handleReceiveMessage)
    onMessageFromSender(handleSentMessage)

    return () => {
      socket.off('recieve_msg', handleReceiveMessage)
    }
  }, [socket, onMessageFromSender, username])

  if (messages.length === 0) {
    return (
      <div className='flex min-h-0 flex-1 items-center justify-center'>
        <p className='text-sm text-ink-muted'>
          No messages yet — say hello!
        </p>
      </div>
    )
  }

  return (
    <div className='scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4 md:px-6'>
      {messages.map((msg, index) => {
        const prev = messages[index - 1]
        const isGroupStart =
          !prev || prev.who !== msg.who || prev.username !== msg.username

        return (
          <Chatmessage
            key={index}
            who={msg.who}
            message={msg.message}
            username={msg.username}
            time={msg.time}
            isGroupStart={isGroupStart}
          />
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
