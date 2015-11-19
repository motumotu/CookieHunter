var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var settings = require(__dirname + '/../config/settings');

app.use(express.static(__dirname + '/../client'));

io.sockets.on('connection', function(socket) {
    console.log("client connected");
    socket.on('update', function(data) {
        console.log("update "+data.x+" "+data.y);
        socket.broadcast.emit('update_players', {
            id: 1,
            x: data.x,
            y: data.y
               
       });
    });
    io.sockets.emit('add_player', {
        id: 1,
        x: 100,
        y: 100
    });
});

http.listen(settings.port, function() {
    console.log("server listen");
})

