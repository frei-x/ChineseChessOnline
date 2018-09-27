const exp = require('express')();
const http = require('http').Server(exp);
let io = require('socket.io')(http);
console.log(io);
exp.get('/',function(req,res){
    res.send('aaa');
    console.log('有人来了');
});
let info = {
    onlineNum:0,

};
io.on('connection', function (socket){
    onlineNum++;
    io.emit('onlineNum',onlineNum);
    socket.on('disconnect', function(){//连接断开事件
         onlineNum--;
         io.emit('onlineNum',onlineNum);
     });
});
http.listen(8090,function () {
  
});