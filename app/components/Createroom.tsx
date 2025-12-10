'use client'
import { useState } from 'react'

interface CreateRoomProps {
  onCreateRoom: (roomData: { roomName: string; duration: number }) => void
}

export default function Createroom({ onCreateRoom }: CreateRoomProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [duration, setDuration] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (roomName.trim() && duration) {
      onCreateRoom({
        roomName: roomName.trim(),
        duration: parseInt(duration),
      })
      // Reset form
      setRoomName('')
      setDuration('')
      setIsOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='bg-black hover:bg-black/80 cursor-pointer text-[#ffffcc] font-bold py-3 px-8 rounded-full transition-colors duration-200'
      >
        CREATE ROOM
      </button>

      {/* this is my form modal*/}
      {isOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-black border-2 border-yellow-100 rounded-2xl p-8 max-w-md w-full'>
            <h2 className='text-2xl font-bold text-yellow-100 mb-6'>
              Create New Room
            </h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-yellow-100 mb-2'>Room Name</label>
                <input
                  type='text'
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className='w-full bg-gray-900 text-yellow-100 px-4 py-2 rounded-lg border border-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-100'
                  placeholder='Enter room name'
                  required
                />
              </div>

              <div>
                <label className='block text-yellow-100 mb-2'>
                  Duration (minutes)
                </label>
                <input
                  type='number'
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className='w-full bg-gray-900 text-yellow-100 px-4 py-2 rounded-lg border border-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-100'
                  placeholder='Enter duration'
                  min='1'
                  required
                />
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  type='submit'
                  className='flex-1 bg-yellow-100 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition-colors duration-200'
                >
                  CREATE
                </button>
                <button
                  type='button'
                  onClick={() => setIsOpen(false)}
                  className='flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors duration-200'
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
