const mysql = require('mysql');
var db = mysql.createConnection({host:'localhost',port:'3306',user:'root',password:'135792468jh',database:'chinesechess'});
function DB(criteria,arrMap,funerr,funsuccess){
    db.query(criteria,arrMap,(err,data)=>{
        if(err){
                funerr(err);
        }else{
                funsuccess(JSON.parse(JSON.stringify(data)));
        }
    });
}
module.exports = DB;