'use client'
import { useState } from 'react'

interface UsernameModalProps {
  onSubmit: (username: string) => void
}

export default function UsernameModal({ onSubmit }: UsernameModalProps) {
  const [username, setUsername] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onSubmit(username.trim())
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center p-4 z-50'>
      <div className='bg-black border-4 border-yellow-100 rounded-2xl p-8 max-w-md w-full shadow-2xl'>
        <h2 className='text-3xl font-bold text-yellow-100 mb-4 text-center'>
          Welcome to Chat App! 🎉
        </h2>
        <p className='text-yellow-100 text-center mb-6'>
          Enter your username to get started
        </p>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='w-full bg-gray-900 text-yellow-100 px-4 py-3 rounded-lg border-2 border-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg'
              placeholder='Enter your username'
              required
              autoFocus
              maxLength={20}
            />
          </div>

          <button
            type='submit'
            className='w-full bg-yellow-100 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition-colors duration-200 text-lg'
          >
            START CHATTING
          </button>
        </form>
      </div>
    </div>
  )
}
