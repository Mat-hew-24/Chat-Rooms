import { MutableRefObject } from 'react'
import Chatroom from './Chatroom'
import Messagebar from './Messagebar'

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

interface ConversationPanelProps {
  currentRoom: Room | undefined
  timeRemaining: number
  handleExitRoom: () => void
  idRef: MutableRefObject<string>
  setMessageSentCallback: (callback: (message: string) => void) => void
  username: string
  handleMessageSent: (message: string) => void
  inRoom: boolean
  currentRoomId: string
}

function formatTime(totalSeconds: number): string {
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

export default function ConversationPanel({
  currentRoom,
  timeRemaining,
  handleExitRoom,
  idRef,
  setMessageSentCallback,
  username,
  handleMessageSent,
  inRoom,
  currentRoomId,
}: ConversationPanelProps) {
  const urgent = timeRemaining <= 60

  return (
    <section className='flex min-h-0 flex-1 flex-col bg-bg'>
      <header className='flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 md:px-6'>
        <div className='flex min-w-0 items-center gap-3'>
          <button
            onClick={handleExitRoom}
            aria-label='Back to rooms'
            className='-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-surface-hover md:hidden cursor-pointer'
          >
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              strokeWidth={2}
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15 19l-7-7 7-7'
              />
            </svg>
          </button>
          <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-ink'>
            {currentRoom?.roomName?.[0]?.toUpperCase() || '?'}
          </span>
          <div className='min-w-0'>
            <h2 className='truncate text-sm font-semibold text-ink'>
              {currentRoom?.roomName || 'Chat Room'}
            </h2>
            <p className='truncate text-xs text-ink-soft'>
              Hosted by {currentRoom?.ownerName}
            </p>
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-3'>
          <span
            className={`rounded-full border px-2.5 py-1 font-mono text-xs tabular-nums ${
              urgent
                ? 'border-danger/30 bg-danger-soft text-danger'
                : 'border-border bg-bg text-ink-soft'
            }`}
            title='Time remaining'
          >
            {formatTime(timeRemaining)}
          </span>
          <button
            onClick={handleExitRoom}
            className='hidden rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-danger/40 hover:bg-danger-soft hover:text-danger md:inline-flex cursor-pointer'
          >
            Leave
          </button>
        </div>
      </header>

      <Chatroom
        idRef={idRef}
        onMessageFromSender={setMessageSentCallback}
        username={username}
      />

      <footer className='shrink-0 border-t border-border bg-surface px-3 py-3 md:px-4'>
        <Messagebar
          idRef={idRef}
          onMessageSent={handleMessageSent}
          inRoom={inRoom}
          roomId={currentRoomId}
        />
      </footer>
    </section>
  )
}
