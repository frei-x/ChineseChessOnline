const exp = require('express')();
const http = require('http').Server(exp);
var svgCaptcha = require('svg-captcha');
var DB = require('./DB');
let io = require('socket.io')(http);
// 加了下面body-parser模块且使用, post请求的req里会带有body属性(前端发送来的数据(自动转json)),不用这个模块需要req.on('data')和end
const bodyParser = require('body-parser');
const cookieParser=require('cookie-parser');
//这个中间件将自动地想response中添加Set-Cookie头，如果req.session的内容被修改了的话。
const cookieSession=require('cookie-session');
// DB('select userName from chess_user where userName=?',['root'],function(err){
//     console.log(err.code);
// },function(data){
//     console.log('chen')
// });
exp.use(bodyParser.json());
exp.use(cookieParser('dada11_ad4ADADA5aAf_lIoqO4444_a1__99a'));
exp.use(cookieSession({
    name: 'un',
    keys: ['dada11_ad4ADADA5aAf_lIoqO4444_a1__99a'+Math.random(),Math.random()+'4444_fafhahuakdsfjks','45f88sdf451dg4_df75g5dfg12d4',Math.random()+9919*Math.random()+'aq'],
    maxAge: 240*3600*1000
}));
// 自动登录/node/autoLogin
exp.use('/node',function(req,res,next){
    console.log(req.body);
    //session无需考虑多用户,存当前就行,每次加载中间件(cookie-session)都会自动的另外开辟内存,无需思考太复杂
    if(req.session['loginTrue']){ //过滤器验证登录
        console.log(req.session['loginTrue']);
        console.log('自动登录成功');
        next();
      }else{
        next();
    }
//    res.cookie('user', 'blue', {signed: true});
    console.log(req.session);
    console.log('签名cookie：', req.signedCookies)
    console.log('无签名cookie：', req.cookies);
   // next();
});
exp.get('/',function(req,res){
    res.send('aaa');
    console.log('有人来了');
});
exp.get('/register',function(req,res){
    res.send('注册');
    console.log('有人来了');
});
exp.post('/node/chessLogin',function(req,res){
    DB('select * from chess_user where userName=? and password=?',[req.body.userName,req.body.passWord],function(err){
        console.log(err.code);
        res.send('数据库错误'+err.code);
        res.end();
    },function(data){
        //设置req.session,后面的send会自动设置并发送cookie
        if(data.length==1){
            req.session['loginTrue'] = data;
            res.send(data);
            console.log(req.session['loginTrue']);
        }else{
            res.send('用户名或密码错误');
            //console.log(req.session['admin']);
        }

    });
    
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