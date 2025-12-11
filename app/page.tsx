'use client'
import Chatroombox from './components/Chatroombox'
import Messagebar from './components/Messagebar'
import Chatroom from './components/Chatroom'
import Createroom from './components/Createroom'
import UsernameModal from './components/UsernameModal'
import { v4 as uuidv4 } from 'uuid'
import { useRef, useCallback, useState, useEffect } from 'react'
import { useSocket } from './components/SocketContext'
import {
  showUserJoinedToast,
  showUserLeftToast,
  showErrorToast,
  showInfoToast,
} from './ui/Toast'

interface Room {
  id: string
  roomName: string
  ownerName: string
  duration: number
  membersCount: number
  ownerId: string
  createdAt?: number // Add optional timestamp for room creation
  expiresAt?: number // Add optional expiry timestamp
}

export default function Home() {
  const { socket, username, setUsername } = useSocket()
  const idRef = useRef<string>(uuidv4())
  const [inRoom, setInRoom] = useState<boolean>(false)
  const [currentRoomId, setCurrentRoomId] = useState<string>('')
  const [rooms, setRooms] = useState<Room[]>([])
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [enteredUsername, setEnteredUsername] = useState<string>('')
  const [timeRemaining, setTimeRemaining] = useState<number>(0) // Add timer state
  const messageSentCallbackRef = useRef<((message: string) => void) | null>(
    null
  )

  const handleMessageSent = useCallback((message: string) => {
    if (messageSentCallbackRef.current) {
      messageSentCallbackRef.current(message)
    }
  }, [])

  const setMessageSentCallback = useCallback(
    (callback: (message: string) => void) => {
      messageSentCallbackRef.current = callback
    },
    []
  )

  useEffect(() => {
    // Show username modal if no username is set
    if (!username) {
      setShowUsernameModal(true)
    }
  }, [username])

  const handleUsernameSubmit = (newUsername: string) => {
    setUsername(newUsername)
    setShowUsernameModal(false)
  }

  const handleCreateRoom = (roomData: {
    roomName: string
    duration: number
  }) => {
    const newRoom = {
      id: uuidv4(),
      ...roomData,
      ownerName: username,
      membersCount: 0,
      ownerId: '', // Will be set by server
    }

    // Only emit to server - don't update local state
    if (socket) {
      socket.emit('create_room', newRoom)
    }
  }

  // Listen for new rooms from other clients
  useEffect(() => {
    if (!socket) return

    // Listen for existing rooms
    socket.on('existing_rooms', (existingRooms: Room[]) => {
      console.log('Received existing rooms:', existingRooms)
      setRooms(existingRooms)
    })

    socket.on(
      'room_expired',
      (data: { roomId: string; roomName: string; message: string }) => {
        console.log('Room expired:', data)

        if (currentRoomId === data.roomId) {
          setInRoom(false)
          setCurrentRoomId('')
          setTimeRemaining(0) // Reset timer
          showErrorToast(`${data.message}`)
        }

        setRooms((prevRooms) =>
          prevRooms.filter((room) => room.id !== data.roomId)
        )
      }
    )

    // Listen for timer updates (optional - to show countdown)
    socket.on(
      'timer_update',
      (data: { roomId: string; timeRemaining: number }) => {
        // Update timer display for current room
        if (currentRoomId === data.roomId) {
          setTimeRemaining(data.timeRemaining)

          if (data.timeRemaining === 60) {
            showInfoToast('1 minute remaining!')
          }
        }
      }
    )

    // Listen for new room created by any client
    socket.on('room_created', (newRoom: Room) => {
      console.log('New room created:', newRoom)
      setRooms((prevRooms) => {
        // Avoid duplicates
        if (prevRooms.some((room) => room.id === newRoom.id)) {
          return prevRooms
        }
        return [...prevRooms, newRoom]
      })
    })

    // Listen for room member count updates
    socket.on('room_updated', (updatedRoom: Room) => {
      console.log('Room updated:', updatedRoom)
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === updatedRoom.id ? updatedRoom : room
        )
      )
    })

    //---------------------------------------------------------------------------------
    // BROADCAST THE TOAST(EXCEPT TO THE SENDER)
    socket.on(
      'user_joined_room',
      (data: {
        userId: string
        roomName: string
        message: string
        username: string
      }) => {
        // Don't show toast for your own join
        if (data.userId !== idRef.current) {
          showUserJoinedToast(data.username)
        }
      }
    )

    // Listen for user left room notification
    socket.on(
      'user_left_room',
      (data: {
        userId: string
        roomName: string
        message: string
        username: string
      }) => {
        if (data.userId !== idRef.current) {
          showUserLeftToast(data.username)
        }
      }
    )

    // Listen for room deletion
    socket.on(
      'room_deleted',
      (data: { roomId: string; roomName: string; reason: string }) => {
        console.log('Room deleted:', data)

        // If user is in the deleted room, exit them
        if (currentRoomId === data.roomId) {
          setInRoom(false)
          setCurrentRoomId('')
          showErrorToast(`Room "${data.roomName}" was deleted: ${data.reason}`)
        }

        // Remove the room from the list
        setRooms((prevRooms) =>
          prevRooms.filter((room) => room.id !== data.roomId)
        )
      }
    )

    // Listen for complete room list updates
    socket.on('rooms_updated', (updatedRooms: Room[]) => {
      console.log('Rooms list updated:', updatedRooms)
      setRooms(updatedRooms)
    })

    // Listen for forced exit from room (due to disconnect)
    socket.on('force_exit_room', (data: { roomId: string; reason: string }) => {
      console.log('Forced exit from room:', data)

      if (currentRoomId === data.roomId) {
        setInRoom(false)
        setCurrentRoomId('')
        showErrorToast(data.reason)
      }
    })

    // Listen for socket disconnect
    socket.on('disconnect', () => {
      console.log('Socket disconnected')

      // If user was in a room, exit them
      if (inRoom) {
        setInRoom(false)
        setCurrentRoomId('')
        showErrorToast(
          'Connection lost. You have been disconnected from the room.'
        )
      }
    })

    // Listen for reconnection
    socket.on('connect', () => {
      console.log('Socket reconnected')

      // If user was in a room when disconnected, they should be back on home
      if (inRoom) {
        setInRoom(false)
        setCurrentRoomId('')
      }
    })

    //------------------------------------------------------------------------------

    return () => {
      socket.off('existing_rooms')
      socket.off('room_created')
      socket.off('room_updated')
      socket.off('user_joined_room')
      socket.off('user_left_room')
      socket.off('room_deleted')
      socket.off('rooms_updated')
      socket.off('force_exit_room')
      socket.off('disconnect')
      socket.off('connect')
      socket.off('room_expired') // timer feature
      socket.off('timer_update') //timer feature
    }
  }, [socket, currentRoomId, inRoom])

  const handleJoinRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId)

    setInRoom(true)
    setCurrentRoomId(roomId)

    // Calculate initial time remaining
    if (room && room.expiresAt) {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((room.expiresAt - now) / 1000))
      setTimeRemaining(remaining)
    } else if (room) {
      // Fallback if expiresAt is not available
      setTimeRemaining(room.duration * 60)
    }

    // Emit join room to update member count
    if (socket) {
      socket.emit('join_chatroom', {
        roomId,
        userId: idRef.current,
        username: username,
      })
    }

    console.log('Joined room:', roomId)
  }

  const handleExitRoom = () => {
    if (socket && currentRoomId) {
      socket.emit('leave_chatroom', {
        roomId: currentRoomId,
        userId: idRef.current,
        username: username,
      })
    }
    setInRoom(false)
    setCurrentRoomId('')
    setTimeRemaining(0) // Reset timer
  }

  const handleDeleteRoom = (roomId: string) => {
    if (socket) {
      socket.emit('delete_room', { roomId })
    }
  }

  // If in room, show only chatroom interface (CHAT ROOM INTERFACE)
  if (inRoom) {
    const currentRoom = rooms.find((room) => room.id === currentRoomId)

    // Format time remaining for display
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
      <>
        {showUsernameModal && (
          <UsernameModal
            onSubmit={handleUsernameSubmit}
            enteredUsername={enteredUsername}
            setEnteredUsername={setEnteredUsername}
          />
        )}
        <div className='min-h-screen bg-amber-100 flex flex-col'>
          {/* top bar inside of a room */}
          <div className='bg-black text-white p-4 flex justify-between items-center'>
            <div>
              <h2 className='text-2xl font-bold'>
                {currentRoom?.roomName || 'Chat Room'}
              </h2>
              <p className='text-gray-400 text-sm'>
                OWNER : {currentRoom?.ownerName}
              </p>
            </div>

            {/* Timer Display */}
            <div className='flex flex-col items-center'>
              <div
                className={`text-3xl font-mono font-bold ${
                  timeRemaining <= 60
                    ? 'text-red-400 animate-pulse'
                    : 'text-yellow-400'
                }`}
              >
                {formatTime(timeRemaining)}
              </div>
              <p className='text-xs text-gray-400 mt-1'>Time Remaining</p>
            </div>

            <button
              onClick={handleExitRoom}
              className='bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200'
            >
              EXIT ROOM
            </button>
          </div>

          {/* Chat area */}
          <div className='flex-1 flex flex-col'>
            <Chatroom
              idRef={idRef}
              onMessageFromSender={setMessageSentCallback}
              username={username}
            />
            <Messagebar
              idRef={idRef}
              onMessageSent={handleMessageSent}
              inRoom={inRoom}
              roomId={currentRoomId}
            />
          </div>
        </div>
      </>
    )
  }

  // Home view with room list
  return (
    <>
      {showUsernameModal && (
        <UsernameModal
          onSubmit={handleUsernameSubmit}
          enteredUsername={enteredUsername}
          setEnteredUsername={setEnteredUsername}
        />
      )}
      <div className='min-h-screen bg-amber-100 py-8 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-full pb-5 mx-auto'>
          <div className='text-center mb-12'>
            <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-4'>
              Chat App
            </h1>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Join exciting chat rooms and connect with people around the world
            </p>
          </div>

          <div className='flex justify-center mb-8'>
            <Createroom onCreateRoom={handleCreateRoom} />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-24'>
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
    </>
  )
}
