const express = require('express');
const { Socket } = require('socket.io');
//initializing our express app
const app = express();
//creating our server
const server = require('http').Server(app);
const io = require('socket.io')(server);
//including an inbuilt module path
// const path = require('path');

//Adding our static folder
app.use(express.static('public'));
//importing the v4 version of uuid
// Version 4 UUID is a universally unique identifier that is generated using random numbers.
const { v4: uuidV4 } = require('uuid');
//imported peer
const { ExpressPeerServer } = require('peer');
//peerserver and express server are now working parallely 
const peerServer = ExpressPeerServer(server, {
  debug: true
});
//telling express to set the view engine as ejs (embedded javascript)
app.set('view engine' , 'ejs');

//telling the express app where all the views are
// app.set('views' , path.join(__dirname , 'views'));

//telling the peerserver what url is it going to use
app.use('/peerjs' , peerServer);

//landing route and controller
app.get('/' , (req , res) => {
    //this will redirect us to '/:room' route
    //creating random id 
    res.redirect(`/${uuidV4()}`);
});
app.get('/:room' , (req , res) => {
    //using req.params.room we are extracting that particular room id and 
    //then we are rendering the room page
     res.render('room' , { roomId : req.params.room });
});

//on connection
io.on('connection' , (socket) => {
    socket.on("join-room", (roomId , userId) => {
        socket.join(roomId);
        // socket.to(roomId).broadcast.emit("user-connected", userId);
        socket.broadcast.to(roomId).emit("user-connected", userId);
        socket.on('message', (message) => {
            //send message to the same room
            io.to(roomId).emit('createMessage', message)
        }); 
    })
})

server.listen(process.env.PORT||9090)

//to create unique id of each room we have used uuid
// npm install uid 
// then we have installed socket.io
//npm install socket.io
//THEN we have installed peerjs