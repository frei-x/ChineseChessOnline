const exp = require('express')();
const http = require('http').Server(exp);
let io = require('socket.io')(http);
let a = 0;
io.on('connection', function (socket){
    console.log('连接');
    if(a%2==0){
        console.log('加入100')
        socket.join('100'); 
    }else{
        console.log('加入101')
        socket.join('100');
    }
    socket.on('test',function(msg,callback){
        socket.in('100').emit('test',msg);
        callback('101');
    });
    console.log(a)
    a++;
 
});
http.listen(8090,function () {
  
});