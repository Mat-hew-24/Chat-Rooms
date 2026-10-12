'use client'
import { useState, MutableRefObject } from 'react'
import { useSocket } from './SocketContext'
import { encryptMessage } from '../utils/encryption'

const inputstyle =
  'flex-1 bg-black text-yellow-100 placeholder-yellow-100 px-3 py-2 md:px-4 md:py-3 rounded-full border border-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:border-transparent text-sm md:text-base'

const btnstyle =
  'bg-yellow-100 hover:bg-yellow-200 text-black p-2 md:p-3 rounded-full transition-colors duration-200 border-3 border-black flex items-center justify-center min-w-10 h-10 md:min-w-12 md:h-12 cursor-pointer'

//  Moved the subcomponent outside to remove rerender issues (always use props)
function MessagebarHTML({
  message,
  setMessage,
  sendMessage,
}: {
  message: string
  setMessage: (msg: string) => void
  sendMessage: () => void
}) {
  return (
    <div className='message-input-container bg-yellow-100'>
      <div className='max-w-4xl mx-auto flex gap-2 md:gap-3 items-center'>
        <input
          type='text'
          placeholder='Type your message...'
          className={inputstyle}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className={btnstyle} onClick={sendMessage}>
          <svg
            className='w-4 h-4 md:w-5 md:h-5 rotate-90'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
          </svg>
        </button>
      </div>
    </div>
  )
}

interface MessageBarProps {
  idRef: MutableRefObject<string>
  onMessageSent: (message: string) => void
  inRoom: boolean
  roomId?: string
}

export default function Messagebar({
  idRef,
  onMessageSent,
  inRoom,
  roomId,
}: MessageBarProps) {
  const { socket, username } = useSocket()
  const [message, setMessage] = useState('')

  const sendMessage = () => {
    if (message.trim() && socket) {
      // Encrypt the message before sending to server
      const encryptedMessage = encryptMessage(message)
      console.log(encryptMessage)

      socket.emit('send_msg', {
        message: encryptedMessage, // Send encrypted message
        senderid: idRef.current,
        username,
        room: roomId, // Include the room ID
      })
      // Pass the original unencrypted message to UI
      onMessageSent(message)
      setMessage('')
    }
  }

  return inRoom ? (
    <MessagebarHTML
      message={message}
      setMessage={setMessage}
      sendMessage={sendMessage}
    />
  ) : null
}
