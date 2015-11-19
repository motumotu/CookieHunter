var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/../client'));

io.on('connection', function(socket) {
    console.log("client connected");
});

http.listen(3000, function() {
    console.log("server listen");
});

