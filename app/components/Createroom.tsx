'use client'
import { useState } from 'react'

interface CreateRoomProps {
  onCreateRoom: (roomData: { roomName: string; duration: number }) => void
}

export default function Createroom({ onCreateRoom }: CreateRoomProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [duration, setDuration] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (roomName.trim() && duration) {
      const durationValue = parseInt(duration)

      if (durationValue > 1440) {
        setError('Duration must be under 24 hours (1440 minutes)')
        return
      }

      if (durationValue < 1) {
        setError('Duration must be at least 1 minute')
        return
      }

      onCreateRoom({
        roomName: roomName.trim(),
        duration: durationValue,
      })
      setRoomName('')
      setDuration('')
      setIsOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label='Create room'
        title='Create room'
        className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-ink-soft transition-colors hover:border-accent hover:text-accent cursor-pointer'
      >
        <svg
          className='h-4 w-4'
          fill='none'
          stroke='currentColor'
          strokeWidth={2}
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' d='M12 5v14M5 12h14' />
        </svg>
      </button>

      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4'>
          <div className='w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl'>
            <h2 className='mb-5 text-lg font-semibold text-ink'>
              Create a room
            </h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-ink-soft'>
                  Room name
                </label>
                <input
                  type='text'
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className='w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent'
                  placeholder='e.g. Design review'
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className='mb-1.5 block text-sm font-medium text-ink-soft'>
                  Duration (minutes, max 1440)
                </label>
                <input
                  type='number'
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className='w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent'
                  placeholder='60'
                  min='1'
                  max='1440'
                  required
                />
              </div>

              {error && (
                <div className='rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger'>
                  {error}
                </div>
              )}

              <div className='flex gap-2 pt-2'>
                <button
                  type='button'
                  onClick={() => setIsOpen(false)}
                  className='flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-hover cursor-pointer'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover cursor-pointer'
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
