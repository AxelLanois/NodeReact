var express = require('express');
var socket = require('socket.io');

var app = express();
var rooms = [];

server = app.listen(5000, function(){
    console.log('server is running on port 5000')
});

io = socket(server);

io.on('connection', (socket) => {
    socket.on("nouveau-client", function (pseudo) {
        rooms.push(pseudo);
        socket.join(pseudo);
    
        socket.pseudo = pseudo;
        socket.emit("list_rooms", rooms);
        socket.broadcast.emit("nouveau-clients", pseudo);
      });

    socket.on('message_private', function(data, room){
        io.to(room).emit('send_message_private', data);
    })

    socket.on('message_public', function(data){
        io.emit('send_message_public', data);
    })

    socket.on("join", function(room, user, roomCurrent){
        //quitte le salon actuel
        socket.leave(roomCurrent);
        //rejoint le nouveau salon
        socket.join(room);
        var msgjoin = {
            author: "serveur",
            message: user + " a rejoint votre salon."
        };

        var msgleave = {
            author: "serveur",
            message: user + " a quitté votre salon."
        };
    
        io.to(roomCurrent).emit('send_message_private', msgleave);
        io.to(room).emit('send_message_private', msgjoin);
      });

    //lors de la déconnexion
    socket.on("disconnect", function(){
        var index = rooms.indexOf(socket.pseudo);
        if(index > -1){
            rooms.splice(index, 1);
        }
        io.emit("room_remove", socket.pseudo);
        io.emit("deconnexion");
    });
});