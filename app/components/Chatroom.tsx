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
  const [messages, setMessages] = useState<
    { who: string; message: string; username: string }[]
  >([])
  const bottomRef = useRef<HTMLDivElement>(null)

  //SMOOTH SCROLL DOWN(instead of scrolltop = scrollheight)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  //

  useEffect(() => {
    if (!socket) return

    const handleReceiveMessage = (data: MessageData) => {
      console.log('Received encrypted message from:', data.username)
      // Decrypt the message before displaying
      const decryptedMessage = decryptMessage(data.message)
      console.log('Decrypted message:', decryptedMessage)

      setMessages((prev) => [
        ...prev,
        { who: 'others', message: decryptedMessage, username: data.username },
      ])
    }

    const handleSentMessage = (message: string) => {
      setMessages((prev) => [...prev, { who: 'user', message, username }])
    }

    socket.on('recieve_msg', handleReceiveMessage)
    onMessageFromSender(handleSentMessage)

    return () => {
      socket.off('recieve_msg', handleReceiveMessage)
    }
  }, [socket, onMessageFromSender, username])

  return (
    <div className='flex flex-col w-full space-y-2 p-3 md:p-4 flex-1 chat-scroll'>
      {messages.map((msg, index) => (
        <Chatmessage
          key={index}
          who={msg.who}
          message={msg.message}
          username={msg.username}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

//OKIEE
