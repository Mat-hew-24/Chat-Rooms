import { io } from 'socket.io-client'
import { useEffect, useRef, useState, MutableRefObject } from 'react'
import Chatmessage from './Chatmessage'

const socket = io('http://localhost:5000')

type chatRoomProp = {
  idRef: MutableRefObject<string>
}

export default function Chatroom({ idRef }: chatRoomProp) {
  const [messages, setMessages] = useState<{ who: string; message: string }[]>(
    []
  )
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    socket.on('recieve_msg', (data) => {
      console.log(data.senderid, socket.id)
      const whoami = data.senderid == idRef.current ? 'user' : 'others'
      setMessages((prev) => [...prev, { who: whoami, message: data.message }])
    })
  }, [socket])

  return (
    <div
      className='flex flex-col w-full bg-teal-500 space-y-2 p-4'
      ref={bottomRef}
    >
      {messages.map((msg, index) => (
        <Chatmessage key={index} who={msg.who} message={msg.message} />
      ))}
    </div>
  )
}
