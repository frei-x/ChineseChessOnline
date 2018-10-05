const exp = require('express')();
const http = require('http').Server(exp);
let io = require('socket.io')(http);
exp.get('/',function(req,res){
    res.send('aaa');
    console.log('有人来了');
});
exp.get('/register',function(req,res){
    res.send('注册');
    console.log('有人来了');
});
exp.get('/login',function(req,res){
    res.send('登录');
    console.log('有人来了');
});
let info = {
    onlineNum:0,
};
io.on('connection', function (socket){
    info.onlineNum++;
    io.emit('onlineNum',info.onlineNum);
    socket.on('disconnect', function(){//连接断开事件
        info.onlineNum--;   
         io.emit('onlineNum',info.onlineNum);
     });
});
http.listen(8090,function () {
  
});