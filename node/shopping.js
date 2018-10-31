const exp = require('express')();
const http = require('http').Server(exp);
var svgCaptcha = require('svg-captcha');
let io = require('socket.io')(http);
const cookieParser=require('cookie-parser');
const bodyParser = require('body-parser');
const cookieSession=require('cookie-session');
const mysql = require('mysql');
var db = mysql.createConnection({host:'localhost',port:'3306',user:'root',password:'135792468jh',database:'shopping'});
function DB(criteria,arrMap,funerr,funsuccess){
    db.query(criteria,arrMap,(err,data)=>{
        if(err){
                funerr(err);
        }else{
                funsuccess(JSON.parse(JSON.stringify(data)));
        }
    });
}
exp.use(bodyParser.json());
exp.use(cookieParser('dada11_ad4ADADA5aAf_lIoqO4444_a1__99a'));
let cookieSessionMiddleware = cookieSession({
    name: 'una',
    keys: ['dada11_ad4ADADA5aAf_lIoqO4444_a1__99a'],
    maxAge: 365*3600*1000*24
});
exp.use(cookieSessionMiddleware);
exp.use('/node/captcha',function(req,res){
    //创建验证码  长度4 干扰线1 不允许出现0o1IiLlNmnM字符
    var captcha = svgCaptcha.create({size:4,noise:1,ignoreChars:'0Oo1IiLlNmnMABCDEFGHIJKLMNOPQRSTUVWXYZ'});
    req.session.captcha = captcha.text;
    console.log(captcha.text);
    console.log(req.session.captcha);
    res.type('SVG');
    res.send(captcha.data);
  });
exp.use(function(req,res,next){
     
       next();
});

//接收post请求 路径为/node/login
exp.post('/node/login',function(req,res){
    DB('select * from admin where user=? and password=?',[req.body.user,req.body.password],function(err){
        console.log(err.code);
        res.status(403).end('数据库错误');
    },function(data){
        //设置req.session,后面的send会自动设置并发送cookie
        if(data.length==1){
            console.log(req.body)
            //保存session
            console.log(req.session)
            if(req.session.captcha==req.body.captcha){
                req.session['loginTrue'] = true;
                console.log(req.session);
                res.send(data);
            }else{
                res.status(403).end('验证码');
            }
           
        }else{
           // req.session['loginTrue'] =false;
            res.status(403).end('登录失败');
            console.log('登录未认证未通过,程序不继续执行');
        }
    });
});
exp.post('/node/change',function(req,res){
    console.log(req.body.arr);
    var str = `mark  40, win =1 where ID =?`
   // update RandomSource set mark = mark + 40, win = win+1 where ID =?
    DB('',[],function(){

    },function(){
       
    })
});
exp.get('/node/adminRoom',function(req,res){
    res.send({
        "code": 0
        ,"msg": ""
        ,"count": 4
        ,"data": [
            { "id": "10008"
            ,"username": "福蓉"
            ,"email": "保密"
            ,"sex": "女"
            ,"city": "四川广安"
            ,"sign": "心塞"
            ,"experience": "106"
            ,"ip": "192.168.0.8"
            ,"logins": "106"
            ,"joinTime": "2018-10-04"
        },
         {
          "id": "10001"
          ,"username": "杜甫"
          ,"email": "xianxin@layui.com"
          ,"sex": "男"
          ,"city": "浙江杭州"
          ,"sign": "点击此处，显示更多。当内容超出时，点击单元格会自动显示更多内容。"
          ,"experience": "116"
          ,"ip": "192.168.0.8"
          ,"logins": "108"
          ,"joinTime": "2016-10-14"
        }, {
          "id": "10002"
          ,"username": "李白"
          ,"email": "xianxin@layui.com"
          ,"sex": "男"
          ,"city": "浙江杭州"
          ,"sign": "君不见，黄河之水天上来，奔流到海不复回。 君不见，高堂明镜悲白发，朝如青丝暮成雪。 人生得意须尽欢，莫使金樽空对月。 天生我材必有用，千金散尽还复来。 烹羊宰牛且为乐，会须一饮三百杯。 岑夫子，丹丘生，将进酒，杯莫停。 与君歌一曲，请君为我倾耳听。(倾耳听 一作：侧耳听) 钟鼓馔玉不足贵，但愿长醉不复醒。(不足贵 一作：何足贵；不复醒 一作：不愿醒/不用醒) 古来圣贤皆寂寞，惟有饮者留其名。(古来 一作：自古；惟 通：唯) 陈王昔时宴平乐，斗酒十千恣欢谑。 主人何为言少钱，径须沽取对君酌。 五花马，千金裘，呼儿将出换美酒，与尔同销万古愁。"
          ,"experience": "12"
          ,"ip": "192.168.0.8"
          ,"logins": "106"
          ,"joinTime": "2016-10-14"
        }, {
          "id": "10003"
          ,"username": "王勃"
          ,"email": "xianxin@layui.com"
          ,"sex": "男"
          ,"city": "浙江杭州"
          ,"sign": "人生恰似一场修行"
          ,"experience": "65"
          ,"ip": "192.168.0.8"
          ,"logins": "106"
          ,"joinTime": "2016-10-14"
        }, {
          "id": "10004"
          ,"username": "李清照"
          ,"email": "xianxin@layui.com"
          ,"sex": "女"
          ,"city": "浙江杭州"
          ,"sign": "人生恰似一场修行"
          ,"experience": "666"
          ,"ip": "192.168.0.8"
          ,"logins": "106"
          ,"joinTime": "2016-10-14"
        }, {
          "id": "10005"
          ,"username": "冰心"
          ,"email": "xianxin@layui.com"
          ,"sex": "女"
          ,"city": "浙江杭州"
          ,"sign": "人生恰似一场修行"
          ,"experience": "86"
          ,"ip": "192.168.0.8"
          ,"logins": "106"
          ,"joinTime": "2016-10-14"
        }, {
          "id": "10006"
          ,"username": "贤心"
          ,"email": "xianxin@layui.com"
          ,"sex": "男"
          ,"city": "浙江杭州"
          ,"sign": "人生恰似一场修行"
          ,"experience": "12"
          ,"ip": "192.168.0.8"
          ,"logins": "106"
          ,"joinTime": "2016-10-14"
        }, {
          "id": "10007"
          ,"username": "贤心"
          ,"email": "xianxin@layui.com"
          ,"sex": "男"
          ,"city": "浙江杭州"
          ,"sign": "人生恰似一场修行"
          ,"experience": "16"
          ,"ip": "192.168.0.8"
          ,"logins": "106"
          ,"joinTime": "2016-10-14"
        }, {
          "id": "10008"
          ,"username": "贤心"
          ,"email": "xianxin@layui.com"
          ,"sex": "男"
          ,"city": "浙江杭州"
          ,"sign": "人生恰似一场修行"
          ,"experience": "106"
          ,"ip": "192.168.0.8"
          ,"logins": "106"
          ,"joinTime": "2016-10-14"
        },{
            "id": "10008"
          ,"username": "福蓉"
          ,"email": "保密"
          ,"sex": "女"
          ,"city": "四川广安"
          ,"sign": "心塞"
          ,"experience": "106"
          ,"ip": "192.168.0.8"
          ,"logins": "106"
          ,"joinTime": "2018-10-04"
        },{
            "id": "10008"
          ,"username": "福蓉"
          ,"email": "保密"
          ,"sex": "女"
          ,"city": "四川广安"
          ,"sign": "心塞"
          ,"experience": "106"
          ,"ip": "192.168.0.8"
          ,"logins": "106"
          ,"joinTime": "2018-10-04"
        },{
            "id": "10008"
          ,"username": "福蓉"
          ,"email": "保密"
          ,"sex": "女"
          ,"city": "四川广安"
          ,"sign": "心塞"
          ,"experience": "106"
          ,"ip": "192.168.0.8"
          ,"logins": "106"
          ,"joinTime": "2018-10-04"
        },{
            "id": "10008"
          ,"username": "福蓉"
          ,"email": "保密"
          ,"sex": "女"
          ,"city": "四川广安"
          ,"sign": "心塞"
          ,"experience": "106"
          ,"ip": "192.168.0.8"
          ,"logins": "106"
          ,"joinTime": "2018-10-04"
        },{
            "id": "10008"
          ,"username": "福蓉"
          ,"email": "保密"
          ,"sex": "女"
          ,"city": "四川广安"
          ,"sign": "心塞"
          ,"experience": "106"
          ,"ip": "192.168.0.8"
          ,"logins": "106"
          ,"joinTime": "2018-10-04"
        },{
            "id": "10008"
          ,"username": "福蓉"
          ,"email": "保密"
          ,"sex": "女"
          ,"city": "四川广安"
          ,"sign": "心塞"
          ,"experience": "106"
          ,"ip": "192.168.0.8"
          ,"logins": "106"
          ,"joinTime": "2018-10-04"
        }]
      })
});
let SessionMiddleware = cookieSession({
    name: 'un',
    keys: ['54454a455daopppmqji8rtf5f','2125d5a4d1_','1895a5fdfkjjkfhjfgn'],
    maxAge: 365*3600*1000*24
});

exp.use(SessionMiddleware);
exp.get('/node/getRoomTop3',function(req,res){
    DB('SELECT * FROM room LIMIT 0, 3',[],function(){

    },function(data){
        res.send(data);
    });
});
exp.get('/node/getRoom',function(req,res){
    DB('SELECT * FROM room',[],function(){

    },function(data){
        res.send({
            "code": 0
            ,"msg": ""
            ,"count": data.length
            ,data:data
        });
    });
});
exp.get('/node/getFood',function(req,res){
    DB('SELECT * FROM food',[],function(){

    },function(data){
        res.send({
            "code": 0
            ,"msg": ""
            ,"count": data.length
            ,data:data
        });
    });
});
exp.post('/node/add',function(req,res){
    console.log(req.body);
    if(req.body.type=='酒店'){
        DB('insert into  room (name,city,meony,url) values(?,?,?,?)',[req.body.name,req.body.city,req.body.meony,req.body.url],function(){

        },function(data){
            console.log(data)
            res.send({
                "code": 0
            });
        });
    }else if(req.body.type=='美食'){
        DB('insert into  food (name,city,meony,url) values(?,?,?,?)',[req.body.name,req.body.city,req.body.meony,req.body.url],function(){

        },function(data){
            console.log(data)
            res.send({
                "code": 0
            });
        });
    }else{

    }

});
http.listen(8090,function () {
  
});