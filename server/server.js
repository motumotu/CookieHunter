var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var settings = require(__dirname + '/../config/settings');

app.use(express.static(__dirname + '/../client'));

const MAX_PLAYER = 100;
var useId = [];
var player = [];
var idList = [];

io.sockets.on('connection', function(socket) {
    idList[socket.id] = getEmptyId();
    useId[idList[socket.id]] = 1;
    player[idList[socket.id]].id = idList[socket.id];
    player[idList[socket.id]].x = 100;
    player[idList[socket.id]].y = 100;
    player[idList[socket.id]].mx = 100;
    player[idList[socket.id]].my = 100;
    player[idList[socket.id]].cookieNum = 0;
    console.log("client connected! "+socket.id+" "+idList[socket.id]);
   
	/*
	 * 更新状態
	 */
    socket.on('update', function(data) {
        player[idList[socket.id]].x = data.x;
        player[idList[socket.id]].y = data.y;
        player[idList[socket.id]].x = data.mx;
        player[idList[socket.id]].my = data.my;
		// 枚数のバリデーション
		if (!isNaN(data.addNum) && data.addNum >= 0 && data.addNum <= 20) {
			player[idList[socket.id]].cookieNum += data.addNum;
		}
        //player[idList[socket.id]].cookieNum = data.cookieNum;
        //console.log(data.x+" "+data.y+" "+data.mx+" "+data.my);
        socket.broadcast.emit('update_players', {
            id: idList[socket.id],
            x: data.x,
            y: data.y,
            mx: data.mx,
            my: data.my,
            cookieNum: data.cookieNum
        });
    });
    // 他プレイヤーに接続を知らせる
    socket.broadcast.emit('add_player', {
        id: idList[socket.id],
        x: 100,
        y: 100,
        mx: 100,
        my: 100,
        cookieNum: 100
    });
    // 既に接続しているプレイヤー情報を送信
    socket.emit('players_state', player);
    // 切断時
    socket.on('disconnect', function() {
        console.log("client disconnected!!");
        socket.broadcast.emit('disconnected_player', idList[socket.id]);
        player[idList[socket.id]].id = 0;
        useId[idList[socket.id]] = 0;
    });
});

http.listen(settings.port, function() {
    console.log("server listen");
    init();
})


function init() {
    for (var i = 0; i <= MAX_PLAYER; i++) {
        player[i] = new Player();
        player[i].id = 0;
        useId[i] = 0;
    }
}
function getEmptyId() {
    for (var i = 1; i <= MAX_PLAYER; i++) {
        if (useId[i] == 0) return i;
    }
    return -1;
}
/*
 * Playerクラス
 */
var Player = function() {
    this.id = 0;
    this.x = 0;
    this.y = 0;
    this.mx = 0;
    this.my = 0;
    this.cookieNum = 0;
}
