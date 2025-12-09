import { io } from 'socket.io-client'
import { useEffect, useState } from 'react'
import Chatmessage from './Chatmessage'

const socket = io('http://localhost:5000')

export default function Chatroom() {
  const [messages, setMessages] = useState<{ who: string; message: string }[]>(
    []
  )

  useEffect(() => {
    socket.on('recieve_msg', (data) => {
      setMessages((prev) => [...prev, { who: 'others', message: data.message }])
    })
  }, [socket])

  return (
    <div className='flex flex-col space-y-2 p-4'>
      {messages.map((msg, index) => (
        <Chatmessage key={index} who={msg.who} message={msg.message} />
      ))}
    </div>
  )
}
