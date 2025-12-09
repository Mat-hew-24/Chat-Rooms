const express = require('express')
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors') //idk this line

app.use(cors()) // idk this line but I know this is middleware(idk what is middleware still)

const PORT = 5000
const server = http.createServer(app)

//idk this
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
})
//

io.on('connection', (socket) => {
  console.log(`User connected : ${socket.id}`)

  //ENTER A ROOM
  socket.on('join_room', (data) => {
    socket.join(data)
    console.log(`User ${socket.id} joined room ${data}`)
    socket.emit('joined_room', { room: data, success: true })
  })

  //LEAVE A ROOM
  socket.on('leave_room', (data) => {
    socket.leave(data)
    console.log(`User ${socket.id} left room ${data}`)
  })

  //EMIT ONLY ROOM WISE
  socket.on('send_msg', (data) => {
    console.log(`Message sent to room ${data.room}:`, data.message)
    socket.to(data.room).emit('recieve_msg', data)
  })

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
  })
})

server.listen(PORT, console.log(`Server started at PORT ${PORT}`))
