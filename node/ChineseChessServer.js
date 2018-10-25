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
let cookieSessionMiddleware = cookieSession({
    name: 'un',
    keys: ['dada11_ad4ADADA5aAf_lIoqO4444_a1__99a',Math.random()+'4444_fafhahuakdsfjks','45f88sdf451dg4_df75g5dfg12d4',Math.random()+9919*Math.random()+'aq'],
    maxAge: 365*3600*1000*24
});
exp.use(cookieSessionMiddleware);
// 自动登录/node/autoLogin
exp.use(function(req,res,next){
    //console.log(req.body);
    //session无需考虑多用户,存当前就行,每次加载中间件(cookie-session)都会自动的另外开辟内存,无需思考太复杂
    //每一个req.session附带的cookie都不同所以不同浏览器req.session['loginTrue']不同,代码里只需要判断固定的然后赋值就行
    if(req.session['loginTrue']){ //过滤器验证登录
        console.log(req.session);
        DB('select * from chess_user where ID=? and userName=?',[req.session.loginTrue[0].ID,req.session.loginTrue[0].userName],function(err){
            console.log(err.code);
            res.status(403).end('数据库错误');
        },function(data){
            if(data.length==1){
                //不发送密码
                data[0].password=null;
                req.session['loginTrue'] = data;
               // res.send(data);
                next();
                console.log('验证通过');
                //不应该发送session保存的数据 应该重新查询,否则 如果数据已更新但发送的数据依旧是上次登录的session中的
               // console.log(req.session['loginTrue']);
            }else{
                res.status(400).end('数据被篡改');
                console.log('数据被篡改');
                //next();
                //console.log(req.session['admin']);
            } 
        });
      }else{
        //自动登录未通过,尝试登录
        DB('select * from chess_user where userName=? and password=?',[req.body.userName,req.body.passWord],function(err){
            console.log(err.code);
            res.status(403).end('数据库错误');
        },function(data){
            //设置req.session,后面的send会自动设置并发送cookie
            if(data.length==1){
                //不发送密码
                data[0].password=null;
                req.session['loginTrue'] = data;
                //res.send(data);
                console.log(req.session['loginTrue']);
                next();
               // req.session['loginTrue']=null;
            }else{
                res.status(403).end('登录失败');
                console.log('登录/自动登录未认证未通过,程序不继续执行');
            }
    
        });
        //next();
    }
//  res.cookie('user', 'blue', {signed: true});
    //console.log(req.session);
    //console.log('签名cookie：', req.signedCookies)
    //console.log('无签名cookie：', req.cookies);
   // next();
});

//把socket.io注册为中间件,并且使用cookieSession  传入socket.request  共享session
io.use(function(socket, next) {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});
function simpleDB(criteria,arr){
    let ResultData;
    DB(criteria,arr,function(err){
        console.log('数据查询出现错误',err.code);
        ResultData = null;
    },function(data){
        ResultData = data;
        console.log(ResultData);
    });
    return ResultData;
}
exp.get('/',function(req,res){
    res.send('aaa');
    console.log('有人来了');
});
exp.get('/register',function(req,res){
    res.send('注册');
    console.log('有人来了');
});
exp.post('/node/chessLogin',function(req,res){
    res.send(req.session['loginTrue'][0]); 
});
exp.post('/node/autoLogin',function(req,res){
    res.send(req.session['loginTrue'][0]);    
});

let gameInfo = {
    onlineNum:0,
    user:[],
};
//loading 加入游戏的用户ID
let gamePlay={
    userID:[],
    roomID:1000,
    //{id:1000 ,red:user,black:user2,map:[]}
    rooms:[],
}
let arrMatch = [];
function jsonToString(json){
    return JSON.stringify(json);
}
//if(userInfo.Verification){matching
    io.on('connection', function (socket){
        if(socket.request.session['loginTrue']){
            console.log(socket.request.session['loginTrue'])
            io.emit('room',arrMatch);
           // console.log(socket.id);
            gameInfo.onlineNum++;
            // gameInfo.userID.push(socket.request.session['loginTrue'].ID);
             gameInfo.user.push(socket.request.session['loginTrue']);
            //  for(let i=0;i<gameInfo.user.length;i++){
                 
            //  }
            //  jsonToString()
            io.emit('gameInfo',gameInfo);
            socket.on('disconnect', function(){//连接断开事件
                gameInfo.onlineNum--;
                gameInfo.user.splice(gameInfo.user.indexOf(socket.request.session['loginTrue']),1);
                io.emit('gameInfo',gameInfo);
                console.log('当前在线用户',gameInfo.user);
                for(let i=0;i<Object.keys(socket.rooms).length;i++){
                    socket.leave(Object.keys(socket.rooms)[i]);
                }
            });
            // socket.on('play', function(msg,callback){
            //     console.log('play事件',msg);
            //     callback('ok');
            //     socket.in('10').emit('play',msg);
            // });
            socket.on('room',function(msg,fun){
                let contain = false;//匹配数组是否包含
                arrMatch.forEach(function(item,index){
                    if(item.ID==socket.request.session['loginTrue'][0].ID){
                        console.log(arrMatch);
                        contain=true;
                    }
                });
                if(!contain&&msg ==0){
                    arrMatch.push(
                        {
                            ID:socket.request.session['loginTrue'][0].ID,
                            red:socket.request.session['loginTrue'][0].ID,
                            black:''
                        }
                    );
                    io.emit('room',arrMatch);
                    if(msg == 0){
                        socket.join(Number(socket.request.session['loginTrue'][0].ID), function(){
                            console.log('创建了房间:'+socket.request.session['loginTrue'][0].ID,socket.rooms);  
                            fun(socket.request.session['loginTrue'][0].ID);
                        }); 
                        console.log('创建成功');
                    }
                }else{
                    
                }
                console.log(socket.rooms);
                console.log(msg);
            });
            socket.on('play',function(msg,fun){
                console.log(socket.rooms);
                if(!socket.rooms[Number(msg.ID)]){
                    socket.join(Number(msg.ID));
                }
                if(msg.ID){
                    socket.to(msg.ID).emit('play',msg);
                    fun('ok');
                    console.log('玩游戏',msg);
                    //游戏状态10 20 游戏结束,开始清算/关闭房间
                if(msg.nowGameState==10||msg.nowGameState==20){
                    if(msg.nowGameState==10){
                       simpleDB('update chess_user set mark = mark + 40, win = win+1 where ID =?',[msg.red]);
                       simpleDB('update chess_user set mark = mark - 30, lose = lose+1 where ID =?',[msg.black]);
                    }else if(msg.nowGameState==20){
                        simpleDB('update chess_user set mark = mark + 45, win = win+1 where ID =?',[msg.black]);
                        simpleDB('update chess_user set mark = mark - 30, lose = lose+1 where ID =?',[msg.red]);
                    }
                    //离开房间,
                    socket.leave(msg.ID);
                    //关闭房间
                    arrMatch.some(function(item,index){
                        if(item.ID==msg.ID){
                            arrMatch.splice(index,1);
                            return true;
                        }
                    });
                    //通知其他客户端
                    io.emit('room',arrMatch);
                }
                    console.log(msg.ID);
                }else{
                    console.log('id错误');
                }
                
            });
            socket.on('selsecUser',function(msg,fun){
                console.log(msg)
                DB('select * from chess_user where ID = ?',[Number(msg.ID)],function(err){
                    console.log(err);
                },function(data){
                    delete data[0].password;
                    fun(data[0]);
                    console.log(data[0]);
                });
                console.log('socket-ID',socket.id);
               // socket.to(socket.id).emit('selsecUser',msg); 
            });
            exp.post('/node/join',function(req,res){
                socket.emit('play','startPlay');
                console.log(socket.rooms);
                let contain = false;
                for(let i=0;i<arrMatch.length;i++){
                   if(arrMatch[i].ID == req.body.ID){
                        contain=i;
                   }else{
                       //
                   }
                }
                console.log(contain);
                //检查是否存在该房间id,如果黑方不存在就加入
                if(typeof contain == 'number'){
                    if(!arrMatch[contain].black){
                        socket.join(Number(req.body.ID), function(){
                            console.log('加入了房间:'+ req.body.ID,socket.rooms);
                            socket.in(req.body.ID).emit('play','startPlay');
                            arrMatch[contain].black =  req.session['loginTrue'][0].ID;   
                            res.send(arrMatch[contain]);          
                        }); 
                        socket.emit('play','startPlay');
                    }else{
                        res.status(402).end('加入失败'); 
                    }
                }else{
                    res.status(402).end('加入失败'); 
                }
            });
            // exp.post('/node/play',function(req,res){
            //     // if(!gamePlay.rooms[gamePlay.rooms.length]){
            //     //     gamePlay.rooms.push({id:gamePlay.roomID++});
            //     //     console.log(gamePlay.rooms);
            //     // }
            //   //  arrMatch.push(req.session['loginTrue'][0]);
            //    // console.log('开始匹配');
                
            //     //没有进入等待列表就进入,已加入就不再加入
            //    // gamePlay.rooms.push({id:gamePlay.roomID++,red:gamePlay.userID[0],black:gamePlay.userID[1]});
            //     if(gamePlay.userID.indexOf(req.session['loginTrue'][0].ID)>-1){ 
            //         //已经进入游戏正在等待中
            //     }else{
            //         gamePlay.userID.push(req.session['loginTrue'][0].ID);
            //     }
            //     //gamePlay.rooms.push({id:gamePlay.roomID++});
            //     for(let i=0;i<gamePlay.rooms.length;i++){
                    
            //     }
            //     if(!gamePlay.rooms.red){
            //         // socket.join((gamePlay.rooms.ID), function(){
            //         //     console.log(socket.rooms);  
            //         // }); 
            //     }
            //     // socket.join(100, function(){
            //     //     console.log(socket.rooms);  
            //     // }); 
            //     for(let i=0;i<gameInfo.user.length;i++){
            //         //跳过自己
            //         if(req.session['loginTrue'][0].ID==gameInfo.user[i][0].ID){
            //             continue;
            //         }else{
            //             //分数相近(±150)优先
            //             if(Math.abs(req.session['loginTrue'][0].mark-gameInfo.user[i][0].mark<=150)){
                            
            //             }else{
                            
            //             }
            //         }
            //     }
                
            // });
        }else{
            console.log('socket认证失败');
            //io也变为中间件 前面的session中间件未执行next(),io.on('connection')这段代码也不会执行
           // socket.disconnect();
        }

    });
//}
let funSocket = {
    build:(req,data)=>{

    },
}
http.listen(8090,function () {
  
});