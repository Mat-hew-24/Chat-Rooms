'use client'
import Chatroombox from './components/Chatroombox'
import Messagebar from './components/Messagebar'
import Chatroom from './components/Chatroom'

export default function Home() {
  return (
    <div className='min-h-screen bg-amber-100 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-full bg-amber-500 pb-5 mx-auto'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-4'>
            Chat App
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Join exciting chat rooms and connect with people around the world
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          <Chatroombox />
          <Chatroombox />
          <Chatroombox />
          <Chatroombox />
          <Chatroombox />
          <Chatroombox />
          <Messagebar />
          <Chatroom />
        </div>
      </div>
    </div>
  )
}
