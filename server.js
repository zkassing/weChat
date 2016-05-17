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

io.on('connection',function (socket) {

});