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
  createdAt?: number
  expiresAt?: number
}

export default function Home() {
  const { socket, username, setUsername } = useSocket()
  const idRef = useRef<string>(uuidv4())
  const [inRoom, setInRoom] = useState<boolean>(false)
  const [currentRoomId, setCurrentRoomId] = useState<string>('')
  const [rooms, setRooms] = useState<Room[]>([])
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [enteredUsername, setEnteredUsername] = useState<string>('')
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
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

  // 1. Initial Modal Logic
  useEffect(() => {
    if (!username) {
      setShowUsernameModal(true)
    }
  }, [username])

  // 2. NEW: RECOVERY EFFECT (For browser refreshes)
  // If username exists but we just connected, tell the server to send rooms
  useEffect(() => {
    if (username && socket) {
      socket.emit('register_user', { username })
    }
  }, [socket, username])

  // 3. UPDATED: Handle name submission
  const handleUsernameSubmit = (newUsername: string) => {
    setUsername(newUsername)
    setShowUsernameModal(false)

    // Tell server who we are so it triggers 'existing_rooms'
    if (socket) {
      socket.emit('register_user', { username: newUsername })
    }
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
      ownerId: '',
    }
    if (socket) {
      socket.emit('create_room', newRoom)
    }
  }

  useEffect(() => {
    if (!socket) return

    socket.on('existing_rooms', (existingRooms: Room[]) => {
      console.log('Received existing rooms:', existingRooms)
      setRooms(existingRooms)
    })

    socket.on('room_expired', (data) => {
      if (currentRoomId === data.roomId) {
        setInRoom(false)
        setCurrentRoomId('')
        setTimeRemaining(0)
        showErrorToast(`${data.message}`)
      }
      setRooms((prevRooms) =>
        prevRooms.filter((room) => room.id !== data.roomId)
      )
    })

    socket.on('timer_update', (data) => {
      if (currentRoomId === data.roomId) {
        setTimeRemaining(data.timeRemaining)
        if (data.timeRemaining === 60) showInfoToast('1 minute remaining!')
      }
    })

    socket.on('room_created', (newRoom: Room) => {
      setRooms((prevRooms) => {
        if (prevRooms.some((room) => room.id === newRoom.id)) return prevRooms
        return [...prevRooms, newRoom]
      })
    })

    socket.on('room_creation_error', (data) => {
      showErrorToast(data.message)
    })

    socket.on('room_updated', (updatedRoom: Room) => {
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === updatedRoom.id ? updatedRoom : room
        )
      )
    })

    socket.on('user_joined_room', (data) => {
      if (data.userId !== idRef.current) showUserJoinedToast(data.username)
    })

    socket.on('user_left_room', (data) => {
      if (data.userId !== idRef.current) showUserLeftToast(data.username)
    })

    socket.on('room_deleted', (data) => {
      if (currentRoomId === data.roomId) {
        setInRoom(false)
        setCurrentRoomId('')
        showErrorToast(`Room "${data.roomName}" was deleted: ${data.reason}`)
      }
      setRooms((prevRooms) =>
        prevRooms.filter((room) => room.id !== data.roomId)
      )
    })

    socket.on('rooms_updated', (updatedRooms: Room[]) => {
      setRooms(updatedRooms)
    })

    socket.on('force_exit_room', (data) => {
      if (currentRoomId === data.roomId) {
        setInRoom(false)
        setCurrentRoomId('')
        showErrorToast(data.reason)
      }
    })

    socket.on('disconnect', () => {
      if (inRoom) {
        setInRoom(false)
        setCurrentRoomId('')
        showErrorToast('Connection lost.')
      }
    })

    socket.on('connect', () => {
      if (inRoom) {
        setInRoom(false)
        setCurrentRoomId('')
      }
    })

    return () => {
      socket.off('existing_rooms')
      socket.off('room_created')
      socket.off('room_creation_error')
      socket.off('room_updated')
      socket.off('user_joined_room')
      socket.off('user_left_room')
      socket.off('room_deleted')
      socket.off('rooms_updated')
      socket.off('force_exit_room')
      socket.off('disconnect')
      socket.off('connect')
      socket.off('room_expired')
      socket.off('timer_update')
    }
  }, [socket, currentRoomId, inRoom])

  const handleJoinRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId)
    setInRoom(true)
    setCurrentRoomId(roomId)

    if (room && room.expiresAt) {
      const remaining = Math.max(
        0,
        Math.floor((room.expiresAt - Date.now()) / 1000)
      )
      setTimeRemaining(remaining)
    }

    if (socket) {
      socket.emit('join_chatroom', {
        roomId,
        userId: idRef.current,
        username: username,
      })
    }
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
    setTimeRemaining(0)
  }

  const handleDeleteRoom = (roomId: string) => {
    if (socket) socket.emit('delete_room', { roomId })
  }

  if (inRoom) {
    const currentRoom = rooms.find((room) => room.id === currentRoomId)
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
        <div className='bg-black text-white p-4 flex justify-between items-center'>
          <div>
            <h2 className='text-2xl font-bold'>
              {currentRoom?.roomName || 'Chat Room'}
            </h2>
            <p className='text-gray-400 text-sm'>
              OWNER: {currentRoom?.ownerName}
            </p>
          </div>
          <div className='flex flex-col items-center'>
            <div
              className={`text-3xl font-mono font-bold ${
                timeRemaining <= 60
                  ? 'text-red-500 animate-pulse'
                  : 'text-green-400'
              }`}
            >
              {formatTime(timeRemaining)}
            </div>
          </div>
          <button
            onClick={handleExitRoom}
            className='bg-red-500 py-2 px-6 rounded-full'
          >
            EXIT ROOM
          </button>
        </div>
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
    )
  }

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
