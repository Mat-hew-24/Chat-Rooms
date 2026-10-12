'use client'
import InRoomView from './components/InRoomView'
import OutOfRoomView from './components/OutOfRoomView'
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
    null,
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
    [],
  )

  useEffect(() => {
    if (!username) {
      setShowUsernameModal(true)
    }
  }, [username])

  useEffect(() => {
    if (username && socket) {
      socket.emit('register_user', { username })
    }
  }, [socket, username])

  const handleUsernameSubmit = (newUsername: string) => {
    setUsername(newUsername)
    setShowUsernameModal(false)
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
        prevRooms.filter((room) => room.id !== data.roomId),
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
          room.id === updatedRoom.id ? updatedRoom : room,
        ),
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
        prevRooms.filter((room) => room.id !== data.roomId),
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
        Math.floor((room.expiresAt - Date.now()) / 1000),
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
    return (
      <InRoomView
        currentRoom={currentRoom}
        timeRemaining={timeRemaining}
        handleExitRoom={handleExitRoom}
        idRef={idRef}
        setMessageSentCallback={setMessageSentCallback}
        username={username}
        handleMessageSent={handleMessageSent}
        inRoom={inRoom}
        currentRoomId={currentRoomId}
      />
    )
  }

  return (
    <OutOfRoomView
      showUsernameModal={showUsernameModal}
      handleUsernameSubmit={handleUsernameSubmit}
      enteredUsername={enteredUsername}
      setEnteredUsername={setEnteredUsername}
      handleCreateRoom={handleCreateRoom}
      rooms={rooms}
      handleJoinRoom={handleJoinRoom}
      socket={socket}
      handleDeleteRoom={handleDeleteRoom}
    />
  )
}
