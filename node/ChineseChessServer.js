const exp = require('express')();
const http = require('http').Server(exp);
let io = require('socket.io')(http);
// 加了下面body-parser模块且使用, post请求的req里会带有body属性(前端数据),不用这个模块需要req.on('data')和end
const bodyParser = require('body-parser');
exp.use(bodyParser.json());
exp.get('/',function(req,res){
    res.send('aaa');
    console.log('有人来了');
});
exp.get('/register',function(req,res){
    res.send('注册');
    console.log('有人来了');
});
exp.post('/node/chessLogin',function(req,res){
    res.send('登录成功');
    console.log(req.body);
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