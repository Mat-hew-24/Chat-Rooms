import { io } from 'socket.io-client'
import { useEffect, useRef, useState } from 'react'
import Chatmessage from './Chatmessage'

const socket = io('http://localhost:5000')

export default function Chatroom() {
  const [messages, setMessages] = useState<{ who: string; message: string }[]>(
    []
  )
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    socket.on('recieve_msg', (data) => {
      setMessages((prev) => [...prev, { who: 'others', message: data.message }])
    })
  }, [socket])

  return (
    <div className='flex flex-col bg-teal-500 space-y-2 p-4' ref={bottomRef}>
      {messages.map((msg, index) => (
        <Chatmessage key={index} who={msg.who} message={msg.message} />
      ))}
    </div>
  )
}
