
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var util=require('util');


//引入settings.js文件
var settings = require('./settings');
//引入flash(connect-flash)模块,flash是一个可以存储特定信息，显示完成后会被清除的模块
var flash = require('connect-flash');
//这两个模块可以将 cookie 信息保存到 mongodb 中。
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
//支持片段视图
var partials = require('express-partials');



var app = express();
//
app.use(partials());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


//把内容存储在mongodb中
app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,// cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    url: 'mongodb://localhost/buguzaoan'

  })
}));


//使用中间件来返回成功和失败的信息
app.use(function(req, res, next){
  //声明变量
  var err = req.session.error
      , msg = req.session.success;
  //删除会话中原有属性
  delete req.session.error;
  delete req.session.success;
  //将错误和正确信息存放到动态试图助手变量中。
  res.locals.message = '';
  if (err) res.locals.message = '<div class="alert alert-error">' + err + '</div>';
  if (msg) res.locals.message = '<div class="alert alert-success">' + msg + '</div>';
  next();
});
//使用中间件把user设置成动态视图助手
app.use(function(req, res, next){
  res.locals.user=req.session.user;
  // res.locals({
  //   user:req.session.user
  // })
next();
})






app.use(express.static(path.join(__dirname, 'public')));

 app.use('/', routes);
app.use('/users', users);



// catch 404 and forward to error
// handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
