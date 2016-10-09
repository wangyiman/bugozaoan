var express = require('express');
var router = express.Router();
var User=require("../models/User");
var Post=require("../models/post");

/* GET home page. */
router.get('/', function(req, res, next) {
  Post.find(null,function(err,posts){
    if(err){
      posts=[];
    }
    res.render("index",{
      title:"首页",
      posts:posts
    });
  });
  
});
router.post('/', function(req, res, next) {
  User.find(req.body.username,function(err,user){
    //首先根据用户名查询是否存在
    if(!user.name){
      req.session.error="用户不存在";
      return res.redirect("/login");
    }
    //验证密码是否正确
    if(user.password!=req.body.password){
      req.session.error="用户密码错误";
      return res.redirect("/login");
    }
    req.session.user=user;
    req.session.success="登录成功";
    res.redirect("/login");
  })
});


router.get('/login', function(req, res, next) {
  res.render('login', { title: 'login' });
});
router.get('/reg', function(req, res, next) {
  res.render('reg', { title: 'reg' });
});

router.post('/login',function(req,res,next){
  //验证用户
  User.find(req.body.username,function(err,user){
    //首先根据用户名查询是否存在
    if(!user.name){
      req.session.error="用户不存在";
      return res.redirect("/login");
    }
    //验证密码是否正确
    if(user.password!=req.body.password){
      req.session.error="用户密码错误";
      return res.redirect("/login");
    }
    req.session.user=user;
    req.session.success="登录成功";
    res.redirect("/");
  })
});
router.post('/reg',function(req,res,next){
  //检验用户两次输入的口令是否一致
  if(req.body["password"]!=req.body['password2']){
    req.session.error="两次输入的口令不一致";
    return res.redirect("/reg");
  }

  //声明需要添加的用户
  var newUser=new User({
    name:req.body.username,
    password:req.body["password"]
  });
  User.find(newUser.name,function(err,user){
    //如果用户已经存在
    if(user){
      req.session.error="该用户已经存在";
      return res.redirect("/reg");
    }
    //如果不存在则添加用户
    newUser.save(function(err){
      if(err){
        req.session.error=err;
        return res.redirect("/reg");
      }
      req.session.user=newUser;
      req.session.success="注册成功";
      res.redirect("/");
    })
  })
});
router.get('/u/:user', function(req, res, next) {
  User.find(req.params.user,function(err,user){
    if(!user){
      req.session.error="用户不存在";
      return res.redirect("/");
    }
    Post.find(user.name,function(err,posts){
      if(err){
        req.session.error=err;
        return req.redirect("/");
      }
      res.render("user",{
        title:user.name,
        posts:posts
      })
    });
  });
});
router.post('/post', function(req, res, next) {
  var currentUser=req.session.user;
  var post=new Post(currentUser.name,req.body.post);
  post.save(function(err){
    if(err){
      req.session.error=err;
      return res.redirect("/");
    }
    req.session.success="发表成功";
    res.redirect("/u/"+currentUser.name);
  });
});
router.get('/logout', function(req, res, next) {
  req.session.user=null;
  req.session.success="退出成功";
  res.redirect("/");
});



module.exports = router;
