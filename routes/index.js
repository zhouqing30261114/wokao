var User = require('../modules/user');

module.exports = function(app){
    // 首页
    app.get('/', function(req, res, next){
        res.send('home');
    });
    // 注册
    app.get('/reg', function(req, res, next){
        res.render('reg');
    });
    app.post('/reg', function(req, res, next){
        var user = new User({
            userName: req.body.userName,
            password: req.body.password,
            cPassword: req.body.cPassword
        });
        user.save(function(err){
            if(err){
                console.log(err);
                res.redirect('/reg');
                return;
            }
            res.redirect('/');
        });
        
        /*user.check().then(user.save).catch(function(err){
            console.log(err);
        });*/


    });
};