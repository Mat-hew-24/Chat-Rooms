const express = require('express')
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

// --- CORS (simple, project-style) ---
app.use(cors())

// --- SERVER ---
const PORT = process.env.PORT || 5000
const server = http.createServer(app)

// --- SOCKET ---
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

// --- DATA ---
const ROOMS_FILE = path.join(__dirname, 'rooms.json')
let rooms = []

function loadRooms() {
  try {
    if (fs.existsSync(ROOMS_FILE)) {
      const data = fs.readFileSync(ROOMS_FILE, 'utf8')
      rooms = JSON.parse(data)
      const now = Date.now()
      rooms = rooms.filter((room) => !(room.expiresAt && room.expiresAt < now))
      saveRooms()
    }
  } catch (error) {
    console.log('Error loading rooms:', error.message)
    rooms = []
  }
}

function saveRooms() {
  try {
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2))
  } catch (error) {
    console.error('Error saving rooms:', error.message)
  }
}

loadRooms()

const userSocketMap = new Map()
const userRoomsMap = new Map()
const socketUsernameMap = new Map()
const roomTimers = new Map()

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  socket.on('register_user', ({ username }) => {
    socketUsernameMap.set(socket.id, username)
    socket.emit('existing_rooms', rooms)
  })

  socket.on('create_room', (newRoom) => {
    if (newRoom.duration > 1440 || newRoom.duration < 1) {
      socket.emit('room_creation_error', {
        message: 'Duration must be between 1 and 1440 minutes',
      })
      return
    }

    const roomWithOwner = {
      ...newRoom,
      ownerId: socket.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + newRoom.duration * 60 * 1000,
    }

    rooms.push(roomWithOwner)
    saveRooms()
    io.emit('room_created', roomWithOwner)

    const timerId = setTimeout(
      () => {
        handleRoomExpiry(roomWithOwner.id)
      },
      newRoom.duration * 60 * 1000,
    )

    roomTimers.set(roomWithOwner.id, timerId)
    startRoomCountdown(roomWithOwner.id)
  })

  socket.on('join_chatroom', ({ roomId, userId, username }) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return

    userSocketMap.set(userId, socket.id)
    if (!userRoomsMap.has(socket.id)) userRoomsMap.set(socket.id, new Set())
    userRoomsMap.get(socket.id).add(roomId)
    socketUsernameMap.set(socket.id, username)

    room.membersCount++
    socket.join(roomId)
    io.emit('room_updated', room)
    saveRooms()

    io.to(roomId).emit('user_joined_room', {
      userId,
      username: username || userId.slice(0, 8),
      roomName: room.roomName,
      message: `${username || 'User'} joined`,
    })
  })

  socket.on('leave_chatroom', ({ roomId, userId, username }) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room || room.membersCount <= 0) return

    room.membersCount--
    if (userRoomsMap.has(socket.id)) userRoomsMap.get(socket.id).delete(roomId)

    socket.to(roomId).emit('user_left_room', {
      userId,
      username: username || userId.slice(0, 8),
      roomName: room.roomName,
      message: `${username || 'User'} left`,
    })

    socket.leave(roomId)
    io.emit('room_updated', room)
    saveRooms()
  })

  socket.on('delete_room', ({ roomId }) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room || room.ownerId !== socket.id) return

    if (roomTimers.has(roomId)) {
      clearTimeout(roomTimers.get(roomId))
      roomTimers.delete(roomId)
    }

    io.to(roomId).emit('room_deleted', {
      roomId,
      roomName: room.roomName,
      reason: 'Owner deleted room',
    })

    rooms = rooms.filter((r) => r.id !== roomId)
    io.emit('rooms_updated', rooms)
    saveRooms()
    io.in(roomId).socketsLeave(roomId)
  })

  function handleRoomExpiry(roomId) {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return

    io.to(roomId).emit('room_expired', {
      roomId,
      roomName: room.roomName,
      message: 'Time is up!',
    })

    rooms = rooms.filter((r) => r.id !== roomId)
    io.emit('rooms_updated', rooms)
    saveRooms()
    io.in(roomId).socketsLeave(roomId)
    roomTimers.delete(roomId)
  }

  function startRoomCountdown(roomId) {
    const interval = setInterval(() => {
      const room = rooms.find((r) => r.id === roomId)
      if (!room) return clearInterval(interval)

      const timeRemaining = room.expiresAt - Date.now()
      if (timeRemaining <= 0) return clearInterval(interval)

      io.to(roomId).emit('timer_update', {
        roomId: room.id,
        timeRemaining: Math.max(0, Math.floor(timeRemaining / 1000)),
      })
    }, 1000)
  }

  socket.on('send_msg', (data) => {
    if (data.room) socket.to(data.room).emit('recieve_msg', data)
  })

  socket.on('disconnect', () => {
    const joinedRooms = userRoomsMap.get(socket.id) || new Set()
    const disconnectedUsername = socketUsernameMap.get(socket.id) || 'User'

    const ownedRooms = rooms.filter((room) => room.ownerId === socket.id)
    ownedRooms.forEach((room) => {
      if (roomTimers.has(room.id)) {
        clearTimeout(roomTimers.get(room.id))
        roomTimers.delete(room.id)
      }

      io.to(room.id).emit('room_deleted', {
        roomId: room.id,
        roomName: room.roomName,
        reason: 'Owner left',
      })
    })

    rooms = rooms.filter((room) => room.ownerId !== socket.id)
    io.emit('rooms_updated', rooms)

    joinedRooms.forEach((roomId) => {
      const room = rooms.find((r) => r.id === roomId)
      if (room && room.membersCount > 0) {
        room.membersCount--
        socket.to(room.id).emit('user_left_room', {
          userId: socket.id,
          username: disconnectedUsername,
          roomName: room.roomName,
        })
        io.emit('room_updated', room)
      }
    })

    saveRooms()
    userRoomsMap.delete(socket.id)
    socketUsernameMap.delete(socket.id)
  })
})

server.listen(PORT, () => {
  console.log(`Server started at PORT ${PORT}`)
})
