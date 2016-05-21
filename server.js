var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    path = require('path');
http.listen(3000);

app.get('/',function (req, res) {
    //设置首页
    res.sendfile(__dirname + '/view/index.html');
});
//配置静态管理
app.use(express.static(path.join(__dirname,'public')));
var nicknames = {},
    usockets = {};

io.on('connection',function (socket) {
//缓存客户端传来的昵称以及socket
    socket.on('nickName',function (data, callback) {
        if(nicknames[data.nick] !== undefined){
            callback(false);
        }else {
            callback(true);
            nicknames[data.nick] = [data.nick,data.src];
            socket.nickname = data.nick;
            usockets[data.nick] = socket;
            usockets[data.nick].emit('owner',data);
            io.emit('addUser',{add:data.nick,nicknames:nicknames,src:data.src});
        }
    });
    //私聊消息发送
    socket.on('message',function (data) {
        usockets[data.to].emit('pmessage',data);
        usockets[data.user].emit('pmessage',data);
    })
    
    //socket客户端断开连接后执行相应操作
    socket.on('disconnect',function () {
        console.log('ds')

    });
});
