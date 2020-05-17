//server side


const express = require('express')
const app = express()
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMsg, generateLocation } = require('./utils/messages')
const {getUser,getUsersInRoom,addUser,removeUser} = require('./utils/users')

//create http express server
const server = http.createServer(app)
//now socketio works with this server
const io = socketio(server)

/*
socket.emit ==> for a client
io.emit ==> for every clients
socket.broadcast.emit ==> for every client except current client

    INSIDE ROOM
io.to.emit ==> for every clients
socket.broadcast.to.emit ==> for every client except current client
*/

const port = process.env.PORT || 3000
const path = require('path')
const publicDirectory = path.join(__dirname, '../public')


//ON client connected
io.on('connection', (socket) => {
    console.log(`New Websocket connection`)


    //server gets acknowledgement from client using callback
    socket.on('sendAll', (msg, callback) => {
        const filter = new Filter()

        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed')
        }
        //to make changes available to all clients ie emitted to all clients
        io.to(getUser(socket.id).room).emit('clientMsg', generateMsg(msg),getUser(socket.id))
        callback()
    })


    socket.on('sendLocation', ({ Latitude, Longitude }, callback) => {
        const url = `https://google.com/maps?q=${Latitude},${Longitude}`
        callback(url)
        io.to(getUser(socket.id).room).emit('clientUrl', generateLocation(url),getUser(socket.id))

    })

      //when clientMsg closes browser
      socket.on('disconnect', () => {
          const user = removeUser(socket.id)
          if(user)
          {
            io.to(user.room).emit('clientMsg', generateMsg(`${user.username} has left `),{username : 'Admin'})
            io.to(user.room).emit('roomData',{
                room : user.room,
                users : getUsersInRoom(user.room)
            })
          }
    })


    //to join room
    socket.on('join', (options,callback) => {

        const {error,user} = addUser({id : socket.id,...options})
        if(error)
        {
            return callback(error)
        }

        //available only at server
        socket.join(user.room)

        //emitted to single client we are refering to
        socket.emit('clientMsg', generateMsg('Welcome!'),{username : 'Admin'})

        //broadcast to all client except current client in a room 
        socket.broadcast.to(user.room).emit('clientMsg', generateMsg(`A new user ${user.username} has joined`),{username : 'Admin'})

        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUsersInRoom(user.room)
        })
        callback()
    })

})

app.use(express.static(publicDirectory))
server.listen(port, () => {
    console.log(`Server is started on port ${port}`)
})