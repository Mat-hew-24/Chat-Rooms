'use client'
import { useEffect, useRef, useState, MutableRefObject } from 'react'
import Chatmessage from './Chatmessage'
import { useSocket } from './SocketContext'

interface MessageData {
  message: string
  senderid: string
  room: string
}

interface ChatRoomProps {
  idRef: MutableRefObject<string>
  onMessageFromSender: (callback: (message: string) => void) => void
}

export default function Chatroom({
  idRef,
  onMessageFromSender,
}: ChatRoomProps) {
  const { socket } = useSocket()
  const [messages, setMessages] = useState<{ who: string; message: string }[]>(
    []
  )
  const bottomRef = useRef<HTMLDivElement>(null)

  //SMOOTH SCROLL DOWN(instead of scrolltop = scrollheight)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  //

  useEffect(() => {
    if (!socket) return

    //for others
    const handleReceiveMessage = (data: MessageData) => {
      console.log('Received message from:', data.senderid)
      setMessages((prev) => [...prev, { who: 'others', message: data.message }])
    }

    //for the sender
    const handleSentMessage = (message: string) => {
      setMessages((prev) => [...prev, { who: 'user', message }])
    }

    socket.on('recieve_msg', handleReceiveMessage)
    onMessageFromSender(handleSentMessage)

    return () => {
      socket.off('recieve_msg', handleReceiveMessage)
    }
  }, [socket, onMessageFromSender])

  return (
    <div className='flex flex-col w-full bg-teal-500 space-y-2 p-4 min-h-96 max-h-96 overflow-y-auto'>
      {messages.map((msg, index) => (
        <Chatmessage key={index} who={msg.who} message={msg.message} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

//OKIEE
