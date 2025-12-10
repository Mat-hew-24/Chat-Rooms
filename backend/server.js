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

io.on('connection', (socket) => {
  console.log(`User connected : ${socket.id}`)

  //SHOW EXISTIING ROOMS TO A NEW CLIENT
  socket.emit('existing_rooms', rooms)

  //ACTUAL ROOM CREATION WHICH GOES TO SERVER
  socket.on('create_room', (newRoom) => {
    const roomWithOwner = {
      ...newRoom,
      ownerId: socket.id,
    }
    rooms.push(roomWithOwner)
    console.log(
      `Room created: ${newRoom.roomName} by ${newRoom.ownerName} (${socket.id})`
    )
    //BROADCAST
    io.emit('room_created', roomWithOwner)
  })

  // Get all rooms request
  socket.on('get_rooms', () => {
    socket.emit('existing_rooms', rooms)
  })

  // Join a chatroom (for messaging)
  socket.on('join_chatroom', ({ roomId, userId }) => {
    const room = rooms.find((r) => r.id === roomId)
    if (room) {
      // Track this user's socket
      userSocketMap.set(userId, socket.id)

      room.membersCount++
      console.log(`User ${userId} joined chatroom ${room.roomName}`)

      // Join the socket room first
      socket.join(roomId)

      // Broadcast updated room to all clients (SHOW THE CHANGE TO OUTSIDE)
      io.emit('room_updated', room)

      // Notify everyone in the room about the new member
      io.to(roomId).emit('user_joined_room', {
        userId,
        roomName: room.roomName,
        message: `User ${userId.slice(0, 8)}... joined the room`,
      })
    }
  })

  // Leave a chatroom (LEAVING MEANS YOU CHANGE THE CHATROOMBOX DATA)
  socket.on('leave_chatroom', ({ roomId, userId }) => {
    const room = rooms.find((r) => r.id === roomId)
    if (room && room.membersCount > 0) {
      room.membersCount--
      console.log(`User ${userId} left chatroom ${room.roomName}`)

      // Notify everyone in the room before leaving
      io.to(roomId).emit('user_left_room', {
        userId,
        roomName: room.roomName,
        message: `User ${userId.slice(0, 8)}... left the room`,
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

  // EMIT ONLY ROOM WISE (IMPORTANT)
  socket.on('send_msg', (data) => {
    console.log(`Message sent:`, data.message)
    // Broadcast to all clients in the room except sender
    if (data.room) {
      socket.to(data.room).emit('recieve_msg', data)
    } else {
      // If no room specified, broadcast to all
      socket.broadcast.emit('recieve_msg', data)
    }
  })

  //ON CLOSING TAB
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)

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
    } else {
      rooms.forEach((room) => {
        const socketRooms = Array.from(socket.rooms)
        if (socketRooms.includes(room.id) && room.membersCount > 0) {
          room.membersCount--
          console.log(
            `User ${socket.id} removed from room ${room.roomName} due to disconnect`
          )
          // Notify other users in the room (toast basically)
          socket.to(room.id).emit('user_left_room', {
            userId: socket.id,
            roomName: room.roomName,
            message: `User disconnected from the room`,
          })

          //this is how you update and show chatroombox
          io.emit('room_updated', room)
        }
      })
    }

    // Clean up user socket mapping
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId)
      }
    }
  })
})

server.listen(PORT, () => {
  console.log(`Server started at PORT ${PORT}`)
})
