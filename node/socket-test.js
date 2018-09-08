//先监听所有请求最后设置静态处理,客户端访问文件源码就会指向源码首页  但是源码又能使用  !!
const express = require('express');
let exp = express();
// exp(req,res)
const http = require('http').Server(exp);
let io = require('socket.io')(http);
//__dirname 当前文件绝对路径slice截取是不包含最后一个索引的
let root_path = __dirname.split('\\').slice(0, -1).join("\\");
//console.log(root_path);
//拦截get请求不允许访问node目录

exp.all(/node/, function (req, res) {    
    res.send('你没有权限访问');
});
exp.all('/', function (req, res) {    
        console.log('访问')
        res.sendFile(root_path + '/socket-test.html');
});
let onlineNum = 0;
io.on('connection', function (socket){//connection 连接
    console.log('用户已连接');
    onlineNum++;
    socket.on('disconnect', function(){//连接断开事件
        console.log('断开了');
        onlineNum--;
    });
    socket.on('chat', function(msg,callback){//服务端的on chat事件  第二个参数 服务端接收到消息前端的回调
        console.log('收到: ' + msg+",当前在线人数:"+onlineNum);
            io.emit('chat', msg);//将收到的msg发给所有人
            callback('发送成功')
    });
});
exp.use(express.static(root_path));
exp.all('*', function (req, res) {    
    res.send('暂无权限访问该页');
});
http.listen(8090, function () {
    //console.log('访问');
});