var crypto = require('crypto');
var db = require('./db');

var User = function(user){
    this.userName = user.userName;
    this.password = user.password;
    this.cPassword = user.cPassword;
};

User.prototype._checkUser = function(){
    var me = this;
    var promise = new Promise(function(resolve, reject){
        if(this.userName === ''){
            err = new Error('用户名不能为空！');
            reject(err);
        }else if(this.password === ''){
            err = new Error('密码不能为空！');
            reject(err);
        }else if(this.cPassword !== this.password){
            err = new Error('两次密码不一致！');
            reject(err);
        }else{
            me.get(me.userName, function(err, rows){
                if(err){
                    reject(err);
                    return;
                }
                if(rows && rows.length > 0){
                    var err = new Error('用户名已存在！');
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        }
    });
    return promise;
};

/*User.prototype.save = function(callback){
    var me = this;
    this._checkUser().then(function(rows){
        var sha1 = crypto.createHash('sha1');
        var hashPassward = sha1.update(me.password).digest('base64');
        var query = 'INSERT INTO users(userName, password) VALUES("'+me.userName+'", "'+hashPassward+'")';
        db.getConnection(function(err, connection){
            if(err){
                callback(err);
                return;
            }
            connection.query(query, function(err, rows, fields){
                if(err){
                    callback(err);
                    return;
                }
                callback();
            });
        });
    }, function(err){
        callback(err);
    });
};*/

User.prototype.save = function(callback){
    var promise = new Promise(function(){
        var sha1 = crypto.createHash('sha1');
        var hashPassward = sha1.update(me.password).digest('base64');
        var query = 'INSERT INTO users(userName, password) VALUES("'+me.userName+'", "'+hashPassward+'")';
        db.getConnection(function(err, connection){
            if(err){
                callback(err);
                return;
            }
            connection.query(query, function(err, rows, fields){
                if(err){
                    callback(err);
                    return;
                }
                callback();
            });
        });
    });
    return promise;
};

User.prototype.get = function(userName, callback){
    // 查询用户信息
    var query = 'SELECT * FROM users WHERE userName="'+userName+'"';
    db.getConnection(function(err, connection){
        if(err){
            callback(err);
            return;
        }
        connection.query(query, function(err, rows, fields){
            if(err){
                callback(err);
                return;
            }
            callback(err, rows);
        });
    });
};

module.exports = User;