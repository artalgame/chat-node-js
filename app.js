var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config');
var log = require('./libs/log')(module);
var mongo = require('mongoskin');
var HttpError = require("error").HttpError;

var dbConnection = mongo.db('mongodb://<alkor1@yandex.ru>:<mankind123>@paulo.mongohq.com:10072/chat');

var app = express();
app.set('port', process.env.PORT);

app.engine('ejs', require("ejs-locals"));//.ejs files should be processed by ejs-locals
app.set('views', __dirname + '/templates');
app.set('view engine', 'ejs');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());

app.use(express.cookieParser());

app.use(app.router);

require("routes")(app);

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err, req, res, next){
    if(typeof err == 'number') {
        err = new HttpError(err);
    }
    
    if(err instanceof HttpError){
        res.sendHttpError(err);
    }esle {
        if(app.get('env') == 'development'){
            express.errorHandler()(err, req, res, next);
        }else{
            log.error(err);
            err = new HttpError(500);
            res.sendHttpError(err);
        }
    }
});

http.createServer(app).listen(app.get('port'), function(){
  log.info('Express server listening on port ' + app.get('port'));
});