const express = require('express')
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

app.use(cors()) // MIDDLEWARE (GOTTA CHECK)

const PORT = 5000
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
})

//ROOM ARRAY(IN MEMORY)
let rooms = []
const userSocketMap = new Map() // Track userId to socketId mapping
const userRoomsMap = new Map() // Track which rooms each socket is in
const socketUsernameMap = new Map() // Track socket.id to username mapping
const roomTimers = new Map() // Track timers of all the rooms

io.on('connection', (socket) => {
  console.log(`User connected : ${socket.id}`)

  //SHOW EXISTIING ROOMS TO A NEW CLIENT
  socket.emit('existing_rooms', rooms)

  //ACTUAL ROOM CREATION WHICH GOES TO SERVER
  socket.on('create_room', (newRoom) => {
    const roomWithOwner = {
      ...newRoom,
      ownerId: socket.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + newRoom.duration * 60 * 1000,
    }
    rooms.push(roomWithOwner)
    console.log(
      `Room created: ${newRoom.roomName} by ${newRoom.ownerName} (${socket.id})`
    )
    //BROADCAST
    io.emit('room_created', roomWithOwner)

    //starting the timer for a particular room
    const timerId = setTimeout(() => {
      handleRoomExpiry(roomWithOwner.id) // Fixed: was handleRoomExpiration
    }, newRoom.duration * 60 * 1000)

    roomTimers.set(roomWithOwner.id, timerId)

    //countdown broadcast function
    startRoomCountdown(roomWithOwner.id)
  })

  // Get all rooms request
  socket.on('get_rooms', () => {
    socket.emit('existing_rooms', rooms)
  })

  // Join a chatroom (for messaging)
  socket.on('join_chatroom', ({ roomId, userId, username }) => {
    const room = rooms.find((r) => r.id === roomId)
    if (room) {
      // Track this user's socket
      userSocketMap.set(userId, socket.id)

      // Track which room this socket joined
      if (!userRoomsMap.has(socket.id)) {
        userRoomsMap.set(socket.id, new Set())
      }
      userRoomsMap.get(socket.id).add(roomId)

      // Track username for this socket
      socketUsernameMap.set(socket.id, username)

      room.membersCount++
      console.log(`User ${userId} joined chatroom ${room.roomName}`)

      // Join the socket room first
      socket.join(roomId)

      // Broadcast updated room to all clients (SHOW THE CHANGE TO OUTSIDE)
      io.emit('room_updated', room)

      // Notify everyone in the room about the new member
      io.to(roomId).emit('user_joined_room', {
        userId,
        username: username || userId.slice(0, 8),
        roomName: room.roomName,
        message: `${username || 'User'} joined the room`,
      })
    }
  })

  // Leave a chatroom (LEAVING MEANS YOU CHANGE THE CHATROOMBOX DATA)
  socket.on('leave_chatroom', ({ roomId, userId, username }) => {
    const room = rooms.find((r) => r.id === roomId)
    if (room && room.membersCount > 0) {
      room.membersCount--
      console.log(`User ${userId} left chatroom ${room.roomName}`)

      // Remove room from user's tracked rooms
      if (userRoomsMap.has(socket.id)) {
        userRoomsMap.get(socket.id).delete(roomId)
      }

      // Notify everyone in the room before leaving
      io.to(roomId).emit('user_left_room', {
        userId,
        username: username || userId.slice(0, 8),
        roomName: room.roomName,
        message: `${username || 'User'} left the room`,
      })

      socket.leave(roomId)
      io.emit('room_updated', room)
      userSocketMap.delete(userId)
    }
  })

  // Delete room (owner only)
  socket.on('delete_room', ({ roomId }) => {
    const room = rooms.find((r) => r.id === roomId)
    if (room && room.ownerId === socket.id) {
      console.log(`Owner deleting room: ${room.roomName}`)

      // Clear timer
      if (roomTimers.has(roomId)) {
        clearTimeout(roomTimers.get(roomId))
        roomTimers.delete(roomId)
      }

      // Notify everyone in the room
      io.to(roomId).emit('room_deleted', {
        roomId: room.id,
        roomName: room.roomName,
        reason: 'Room deleted by owner',
      })

      // Remove the room
      rooms = rooms.filter((r) => r.id !== roomId)
      io.emit('rooms_updated', rooms)

      // Make all sockets leave the room
      io.in(roomId).socketsLeave(roomId)
    }
  })

  // Handle room expiry
  function handleRoomExpiry(roomId) {
    const room = rooms.find((r) => r.id === roomId)
    if (room) {
      console.log(`Room expired: ${room.roomName}`)

      // Notify everyone in the room
      io.to(roomId).emit('room_expired', {
        roomId: room.id,
        roomName: room.roomName,
        message: 'Time is up! Room is closing.',
      })

      // Remove the room
      rooms = rooms.filter((r) => r.id !== roomId)
      io.emit('rooms_updated', rooms)

      // Make all sockets leave the room
      io.in(roomId).socketsLeave(roomId)

      // Clean up timer
      roomTimers.delete(roomId)
    }
  }

  // Broadcast countdown every second
  function startRoomCountdown(roomId) {
    const interval = setInterval(() => {
      const room = rooms.find((r) => r.id === roomId)
      if (!room) {
        clearInterval(interval)
        return
      }

      const timeRemaining = room.expiresAt - Date.now()
      if (timeRemaining <= 0) {
        clearInterval(interval)
        return
      }

      // Broadcast remaining time to room
      io.to(roomId).emit('timer_update', {
        roomId: room.id,
        timeRemaining: Math.max(0, Math.floor(timeRemaining / 1000)), // seconds
      })
    }, 1000)
  }

  // EMIT ONLY ROOM WISE (IMPORTANT)
  socket.on('send_msg', (data) => {
    console.log(
      `Message sent by ${data.username} to room ${data.room}:`,
      data.message
    )

    // Only broadcast to the specific room if room is provided (to  is used for doing something inside a room)
    if (data.room) {
      socket.to(data.room).emit('recieve_msg', data)
      console.log(`Message sent only to room: ${data.room}`)
    } else {
      console.warn('No room specified for message, not broadcasting')
    }
  })

  //ON CLOSING TAB
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)

    // Get all rooms this socket was in
    const joinedRooms = userRoomsMap.get(socket.id) || new Set()
    const disconnectedUsername = socketUsernameMap.get(socket.id) || 'User'

    const ownedRooms = rooms.filter((room) => room.ownerId === socket.id)

    if (ownedRooms.length > 0) {
      ownedRooms.forEach((room) => {
        console.log(`Owner left, deleting room: ${room.roomName}`)
        io.to(room.id).emit('room_deleted', {
          roomId: room.id,
          roomName: room.roomName,
          reason: 'Owner left the room',
        })
      })

      rooms = rooms.filter((room) => room.ownerId !== socket.id)
      io.emit('rooms_updated', rooms)
    }

    // Handle all rooms the user was in (not owner)
    joinedRooms.forEach((roomId) => {
      const room = rooms.find((r) => r.id === roomId)
      if (room && room.membersCount > 0) {
        room.membersCount--
        console.log(
          `User ${disconnectedUsername} removed from room ${room.roomName} due to disconnect`
        )

        // Notify other users in the room with the actual username
        socket.to(room.id).emit('user_left_room', {
          userId: socket.id,
          username: disconnectedUsername,
          roomName: room.roomName,
          message: `${disconnectedUsername} disconnected from the room`,
        })

        // Notify the disconnected user to exit the room
        io.to(socket.id).emit('force_exit_room', {
          roomId: room.id,
          reason: 'You have been disconnected',
        })

        // Update room for all clients
        io.emit('room_updated', room)
      }
    })

    // Clean up user socket mapping
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId)
      }
    }

    // Clean up user rooms mapping
    userRoomsMap.delete(socket.id)

    // Clean up username mapping
    socketUsernameMap.delete(socket.id)
  })
})

server.listen(PORT, () => {
  console.log(`Server started at PORT ${PORT}`)
})
