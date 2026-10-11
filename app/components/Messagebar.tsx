'use client'
import { useState, MutableRefObject } from 'react'
import { useSocket } from './SocketContext'
import { encryptMessage } from '../utils/encryption'

function MessagebarHTML({
  message,
  setMessage,
  sendMessage,
}: {
  message: string
  setMessage: (msg: string) => void
  sendMessage: () => void
}) {
  const canSend = message.trim().length > 0

  return (
    <div className='mx-auto flex max-w-4xl items-end gap-2'>
      <div className='flex-1 rounded-xl border border-border bg-bg px-3.5 py-2.5 transition-colors focus-within:border-accent'>
        <input
          type='text'
          placeholder='Type a message'
          className='w-full bg-transparent text-sm text-ink placeholder-ink-muted outline-none'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
      </div>
      <button
        onClick={sendMessage}
        disabled={!canSend}
        aria-label='Send message'
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
          canSend
            ? 'bg-accent text-white hover:bg-accent-hover cursor-pointer'
            : 'bg-surface-hover text-ink-muted cursor-not-allowed'
        }`}
      >
        <svg
          className='h-4 w-4 rotate-90'
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
        </svg>
      </button>
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
      const encryptedMessage = encryptMessage(message)

      socket.emit('send_msg', {
        message: encryptedMessage,
        senderid: idRef.current,
        username,
        room: roomId,
      })
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
