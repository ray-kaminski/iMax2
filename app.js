var express = require('express');
var path = require('path');
var fs = require('fs');
var pathJoin = require('path').join;
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore');

var config = {
  frontEndRoot : "FrontEnd",
  appDir : "app"
};

config.getAppRoot = function() {
  return pathJoin(__dirname,config.frontEndRoot,config.appDir);
};

config.getScreenRoot = function() {
  return pathJoin(__dirname,config.frontEndRoot,config.appDir,'Screens');
};

config.getScreenDir = function(screen) {
  return pathJoin(config.getScreenRoot(),screen);
};

config.getScriptsDir = function(screen){
  var screenDir = config.getScreenDir(screen);
  return pathJoin(screenDir,'scripts');
};

var app = express();

// view engine setup
app.set('views', path.join(config.getAppRoot(), 'views'));
app.set('view engine','html');
app.engine('html',require('consolidate').underscore);


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(config.getAppRoot()));

//if we get into this function it is because the route above did not find a static file and
//send it back to the server.  We will test to see if the path sent in is a valid directory
app.use('/screens/:screenid/*',function(req,res,next) {

  var dirName = config.getScreenDir(req.params.screenid);
  if (req.params[0].length > 0 || !fs.lstatSync(dirName).isDirectory())
  {
    next();
    return;
  }
  var stats = fs.lstatSync(dirName);
  if (!stats.isDirectory()){

  }
  console.log(dirName);
  res.render('screenTemplate', { title: req.params.screenid });
});

app.use('/screenApi/*/scriptManifest',function(req,res,next) {
  var dir = config.getScriptsDir(req.params[0]);
  var files = fs.readdirSync(dir);
  var manifest = {};
  manifest.scriptFiles = files;
  res.send(manifest);
});

// catch 404 and forward to error handler
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
