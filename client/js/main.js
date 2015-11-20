$(function() {
    const MAX_PLAYER = 100;
    const MOVE_SPEED = 5;
    const PLAYER_SIZE = 50;

    const COOKIE_POS_X = 30;
    const COOKIE_POS_Y = 30;
    const COOKIE_SIZE = 150;
    const BATTLE_AREA_POS_X = 210;

    //var io = require('socket.io-client');
    var container = document.getElementById("canvasContainer");
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var imageMap;
    var imagePlayer;
    var imageCookie;
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
        this.mx = 0;
        this.my = 0;
        this.cookieNum = 0;
    }
    var MyState = function() {
        this.x = 0;
        this.y = 0;
        this.mx = 0;
        this.my = 0;
        this.cookieNum = 0;
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
        //my.x = mousex;
        //my.y = mousey;
        //---- バトルエリア
        if (mousex >= BATTLE_AREA_POS_X) {
            //my.mx = mousex - PLAYER_SIZE / 2;
            //my.my = mousey - PLAYER_SIZE / 2;
            var dx = mousex - (getX() + PLAYER_SIZE / 2);
            var dy = mousey - (getY() + PLAYER_SIZE / 2);
            my.mx += dx;
            my.my += dy;
        }
        //---- クッキーのクリック
        if (mousex >= COOKIE_POS_X && mousex <= COOKIE_POS_X + COOKIE_SIZE &&
            mousey >= COOKIE_POS_Y && mousey <= COOKIE_POS_Y + COOKIE_SIZE) {
            my.cookieNum++;
        }
    });
    
    socket.on('add_player', function(data) {
        var n = data.id;
        players[n].id = n;
        players[n].x = data.x;
        players[n].y = data.y;
        players[n].mx = data.mx;
        players[n].my = data.my;
        players[n].cookieNum = data.cookieNum;
    });
    
    socket.on('update_players', function(data) {
        var n = data.id;
        players[n].id = data.id;
        //players[n].x = data.x;
        //players[n].y = data.y;
        players[n].mx = data.mx;
        players[n].my = data.my;
        players[n].cookieNum = data.cookieNum;
    });

    //socket.on('

    function init() {
        settingCanvas();
        loadImage();
        my = new MyState();
        my.x = 100;
        my.y = 100;
        my.mx = 100;
        my.my = 100;
        my.cookieNum = 100;
        for (var i = 0; i < MAX_PLAYER; i++) {
            players[i] = new PlayerState();
        }
    }

    function update() {
        updateMy();
        updatePlayers();
    }
    // 自分の位置更新 
    function updateMy() {
        if (Math.abs(my.x - my.mx) < 0.1 && Math.abs(my.y - my.my) < 0.1) return;
        var dx = my.mx - my.x;
        var dy = my.my - my.y;
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len >= MOVE_SPEED) {
            dx *= MOVE_SPEED / len;
            dy *= MOVE_SPEED / len;
        }
        my.x += dx;
        my.y += dy;
    }

    // 他プレイヤーたちの更新
    function updatePlayers() {
        for (var i = 0; i < MAX_PLAYER; i++) {
            if (players[i].id == 0) continue;
            var dx = players[i].mx - players[i].x;
            var dy = players[i].my - players[i].y;
            if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) continue;
            var len = Math.sqrt(dx * dx + dy * dy);
            if (len >= MOVE_SPEED) {
                dx *= MOVE_SPEED / len;
                dy *= MOVE_SPEED / len;
            }
            players[i].x += dx;
            players[i].y += dy;
        }
    }

    function draw() {
        context.fillStyle="rgba(255,255,255,1)";
        context.fillRect(0, 0, canvas.width, canvas.height);
        drawMap();
        drawMy();
        drawPlayer();
        drawCookie();
    }

    function loadImage() {
        imageMap = new Image();
        imagePlayer = new Image();
        imageCookie = new Image();
        imageMap.src = "image/map1.png";
        imagePlayer.src = "image/player.png";
        imageCookie.src = "image/cookie.png";
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
        var px = getX();
        var py = getY();
        context.drawImage(imagePlayer, px, py);
        context.fillStyle = "black";
        context.font = "italic 15px sans-serif";
        //context.fillText(my.cookieNum, my.x + 5, my.y + 40);
        context.fillText(my.cookieNum, px + 5, py + 40);
    }

    function drawPlayer() {
        var px = getX();
        var py = getY();
        context.fillStyle = "black";
        context.font = "italic 15px sans-serif";
        for (var i = 0; i < MAX_PLAYER; i++) {
            // キャラ画像
            if (players[i].id == 0) continue;
            console.log(my.x+" "+players[i].x+" "+my.y+" "+players[i].y);
            context.drawImage(imagePlayer, px - (my.x - players[i].x), py - (my.y - players[i].y));
            // クッキーの枚数
            //context.fillText(players[i].cookieNum, px + players[i].x + 5, py + players[i].y + 40);
            context.fillText(players[i].cookieNum, px - (my.x - players[i].x) + 5, py - (my.y - players[i].y) + 40);
        }
    }

    function drawCookie() {
        context.fillStyle="rgba(40,40,40,0.5)";
        context.fillRect(0, 0, 210, canvas.height);
        context.drawImage(imageCookie, COOKIE_POS_X, COOKIE_POS_Y);
        context.fillRect(0, 10, 210, 40);
        context.fillStyle = "white";
        context.font = "italic  30px sans-serif";
        context.fillText(my.cookieNum+" Cookie", 30, 40);
    }

    function getX() {
        return (canvas.width - BATTLE_AREA_POS_X) / 2 + BATTLE_AREA_POS_X - PLAYER_SIZE / 2;
    }

    function getY() {
        return canvas.height / 2 - PLAYER_SIZE / 2;
    }
})
