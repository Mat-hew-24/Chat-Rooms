import React from 'react'
import UsernameModal from './UsernameModal'
import Createroom from './Createroom'
import Chatroombox from './Chatroombox'

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

interface OutOfRoomViewProps {
  showUsernameModal: boolean
  handleUsernameSubmit: (newUsername: string) => void
  enteredUsername: string
  setEnteredUsername: (username: string) => void
  handleCreateRoom: (roomData: { roomName: string; duration: number }) => void
  rooms: Room[]
  handleJoinRoom: (roomId: string) => void
  socket: any
  handleDeleteRoom: (roomId: string) => void
}

const OutOfRoomView: React.FC<OutOfRoomViewProps> = ({
  showUsernameModal,
  handleUsernameSubmit,
  enteredUsername,
  setEnteredUsername,
  handleCreateRoom,
  rooms,
  handleJoinRoom,
  socket,
  handleDeleteRoom,
}) => {
  return (
    <div className='min-h-screen bg-amber-100 py-8 px-4'>
      {showUsernameModal && (
        <UsernameModal
          onSubmit={handleUsernameSubmit}
          enteredUsername={enteredUsername}
          setEnteredUsername={setEnteredUsername}
        />
      )}
      <div className='max-w-full pb-5 mx-auto'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold mb-4'>Chat App</h1>
        </div>
        <div className='flex justify-center mb-8'>
          <Createroom onCreateRoom={handleCreateRoom} />
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {rooms.map((room) => (
            <Chatroombox
              key={room.id}
              roomName={room.roomName}
              ownerName={room.ownerName}
              membersCount={room.membersCount}
              duration={room.duration}
              onJoin={() => handleJoinRoom(room.id)}
              isOwner={socket?.id === room.ownerId}
              onDelete={() => handleDeleteRoom(room.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default OutOfRoomView
