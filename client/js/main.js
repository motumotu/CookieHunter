$(function() {
    //var io = require('socket.io-client');
    container = document.getElementById("canvasContainer");
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    context.fillRect(10, 10, 50, 50);

    var socket = io.connect();
})
