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
  socket.on('send_msg', (data) => {
    socket.broadcast.emit('recieve_msg', data)
  })
})

server.listen(PORT, console.log(`Server started at PORT ${PORT}`))
