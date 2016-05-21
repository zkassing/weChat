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
var nicknames = [],
    users = {},
    usockets = {};

io.on('connection',function (socket) {
//缓存客户端传来的昵称以及socket
    socket.on('nickName',function (data, callback) {
        if(nicknames.indexOf(data) != -1){
            callback(false);
        }else {
            callback(true);
            nicknames.push(data);
            socket.nickname = data;
            users[data] = data;
            usockets[data] = socket;
            var name = data.substr(data.length-1,1);
            usockets[data].emit('owner',{head:name,name:data})
            io.emit('addUser',{name:name,add:data,nicknames:nicknames,nickcount:nicknames.length});
        }
    });
    //私聊消息发送
    socket.on('message',function (data) {
        usockets[data.to].emit('pmessage',data);
        usockets[data.user].emit('pmessage',data);
    })
    
    //socket客户端断开连接后执行相应操作
    socket.on('disconnect',function () {
        if (!socket.nickname) return;
        if (nicknames.indexOf(socket.nickname) > -1){
            nicknames.splice(nicknames.indexOf(socket.nickname), 1);
            io.emit('leave',{name:socket.nickname,nickcount:nicknames.length});
        }
    });
});
