$(function() {
    const MAX_PLAYER = 100;

    //var io = require('socket.io-client');
    var container = document.getElementById("canvasContainer");
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var imageMap;
    var imagePlayer;
    var wait = 100;
    var my;
    var queue = null;
    var socket = io.connect();
    var players = [];
    /*var playerState = {
        id: 0,
        x: 0,
        y: 0
    };
    */
    var PlayerState = function() {
        this.id = 0;
        this.x = 0;
        this.y = 0;
    }
    var MyState = function() {
        this.x = 0;
        this.y = 0;
    }

    window.onload = function() {
        init();
        setInterval(function() {
            update();
            draw();
        }, 16);
        setInterval(function() {
            emitServer();
        }, 1000);
    }

    function emitServer() {
        socket.emit('update', my);
    }

    window.addEventListener("resize", function() {
        clearTimeout(queue);
        queue = setTimeout(function() {
            settingCanvas();
        }, wait);
    }, false);

    function settingCanvas() {
        $('#canvas').attr('width', $('#canvasContainer').width());
        $('#canvas').attr('height', $('#canvasContainer').height());
    }
    
    $("canvas").mousedown(function(e) {
        var mousex = e.clientX;
        var mousey = e.clientY;
        my.x = mousex;
        my.y = mousey;
    });
    
    socket.on('add_player', function(data) {
        console.log("add_player "+data.id+" "+data.x+" "+data.y);
        var n = data.id;
        players[n].id = n;
        players[n].x = data.x;
        players[n].y = data.y;
    });
    
    socket.on('update_players', function(data) {
        console.log("update_players "+data.id+" "+data.x+" "+data.y);
        var n = data.id;
        players[n].id = data.id;
        players[n].x = data.x;
        players[n].y = data.y;
    });

    //socket.on('

    function init() {
        settingCanvas();
        loadImage();
        my = new MyState();
        for (var i = 0; i < MAX_PLAYER; i++) {
            players[i] = new PlayerState();
        }
    }

    function update() {

    }

    function draw() {
        context.fillStyle="rgba(255,255,255,1)";
        context.fillRect(0, 0, canvas.width, canvas.height);
        drawMap();
        drawMy();
        drawPlayer();
    }

    function loadImage() {
        imageMap = new Image();
        imagePlayer = new Image();
        imageMap.src = "image/map1.png";
        imagePlayer.src = "image/player.png";
    }

    function drawMap() {
        for (var y = 0; y < 50; y++) {
            for (var x = 0; x < 50; x++) {
                var px = 40 * x;
                var py = 40 * y;
                if (px > canvas.width) break;
                if (py > canvas.height) break;
                context.drawImage(imageMap, 40 * x, 40 * y);
            }
        }
    }

    function drawMy() {
        context.drawImage(imagePlayer, my.x, my.y);
    }
    function drawPlayer() {
        for (var i = 0; i < MAX_PLAYER; i++) {
            if (players[i].id == 0) continue;
            console.log("draw "+players[i].x+" "+players[i].y);
            context.drawImage(imagePlayer, players[i].x, players[i].y);
        }
    }
})
