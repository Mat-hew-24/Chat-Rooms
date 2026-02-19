import Chatroom from './Chatroom'
import Messagebar from './Messagebar'
import { showErrorToast, showInfoToast } from '../ui/Toast'
import React from 'react'

interface Room {
  id: string
  roomName: string
  ownerName: string
  duration: number
  membersCount: number
  ownerId: string
  createdAt?: number
  expiresAt?: number
}

interface InRoomViewProps {
  currentRoom: Room | undefined
  timeRemaining: number
  handleExitRoom: () => void
  idRef: React.MutableRefObject<string>
  setMessageSentCallback: (callback: (message: string) => void) => void
  username: string
  handleMessageSent: (message: string) => void
  inRoom: boolean
  currentRoomId: string
}

const InRoomView: React.FC<InRoomViewProps> = ({
  currentRoom,
  timeRemaining,
  handleExitRoom,
  idRef,
  setMessageSentCallback,
  username,
  handleMessageSent,
  inRoom,
  currentRoomId,
}) => {
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  }

  return (
    <div className='min-h-screen bg-amber-100 flex flex-col'>
      <header className='timer-bar'>
        <div className='w-full max-w-7xl mx-auto flex items-center justify-between'>
          <div className='flex-1 min-w-0'>
            <h2 className='text-2xl md:text-3xl font-bold truncate leading-tight'>
              {currentRoom?.roomName || 'Chat Room'}
            </h2>
            <p className='text-[16px] md:text-xl text-gray-400 uppercase tracking-tighter truncate'>
              {currentRoom?.ownerName}
            </p>
          </div>

          <div className='flex-none px-2'>
            <div
              className={`text-3xl font-mono font-black tabular-nums tracking-tight ${
                timeRemaining <= 60
                  ? 'text-red-500 animate-pulse'
                  : 'text-green-400'
              }`}
            >
              {formatTime(timeRemaining)}
            </div>
          </div>

          <div className='flex-1 flex justify-end'>
            <button
              onClick={handleExitRoom}
              className='bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black py-1.5 px-4 rounded text-[16px] md:text-xl transition-all uppercase cursor-pointer'
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      <main className='chat-container flex-grow'>
        <Chatroom
          idRef={idRef}
          onMessageFromSender={setMessageSentCallback}
          username={username}
        />
      </main>

      <footer className='fixed-message-bar'>
        <div className='max-w-7xl mx-auto w-full'>
          <Messagebar
            idRef={idRef}
            onMessageSent={handleMessageSent}
            inRoom={inRoom}
            roomId={currentRoomId}
          />
        </div>
      </footer>
    </div>
  )
}

export default InRoomView
