'use client'
import { useState, MutableRefObject } from 'react'
import { useSocket } from './SocketContext'

const inputstyle: string =
  'flex-1 bg-black text-yellow-100 placeholder-yellow-100 px-4 py-3 rounded-full border border-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:border-transparent'

const btnstyle: string =
  'bg-yellow-100 hover:bg-yellow-500 text-black p-3 rounded-full transition-colors duration-200 flex items-center justify-center min-w-12 h-12 cursor-pointer'

interface MessageBarProps {
  idRef: MutableRefObject<string>
  onMessageSent: (message: string) => void
}

export default function Messagebar({ idRef, onMessageSent }: MessageBarProps) {
  const { socket } = useSocket()
  const [message, setMessage] = useState<string>('')
  const [room, setRoom] = useState<string>('')
  const [currentRoom, setCurrentRoom] = useState<string>('')

  const sendMessage = () => {
    if (message.trim() && currentRoom && socket) {
      const messageData = {
        message,
        senderid: idRef.current,
        room: currentRoom,
      }
      socket.emit('send_msg', messageData)

      // SHOW USER HIS OWN MSG(USER MODE)
      onMessageSent(message)
      setMessage('')
    }
  }

  const joinRoom = () => {
    if (room.trim() && socket) {
      // Leave previous room if exists (ONLY ONE ROOM)
      if (currentRoom) {
        socket.emit('leave_room', currentRoom)
      }

      socket.emit('join_room', room)
      setCurrentRoom(room)
      setRoom('')
    }
  }

  return (
    <div className='fixed bottom-0 left-0 right-0 p-4'>
      <div className='max-w-4xl text- mx-auto flex gap-3 items-center'>
        {currentRoom && (
          <div className='text-white bg-green-600 px-3 py-2 rounded-full text-sm'>
            Room: {currentRoom}
          </div>
        )}
        <input
          type='text'
          placeholder='enter room'
          className={inputstyle}
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              joinRoom()
            }
          }}
        />
        <button className={btnstyle} onClick={joinRoom}>
          {/*svg let this be this one is generated okyy*/}
          <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
            <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
          </svg>
        </button>
        <input
          type='text'
          placeholder={
            currentRoom ? 'Type your message...' : 'Join a room first...'
          }
          className={inputstyle}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage()
            }
          }}
          disabled={!currentRoom}
        />
        <button
          className={btnstyle}
          onClick={sendMessage}
          disabled={!currentRoom}
        >
          {/*svg let this be this one is generated okyy*/}
          <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
            <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
          </svg>
        </button>
      </div>
    </div>
  )
}

//OKIEEE DONE
