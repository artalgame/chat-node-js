var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config');
var log = require('./libs/log')(module);
var mongo = require('mongoskin');
var mongoose = require('./libs/mongoose');
var HttpError = require("./error").HttpError;
var sessionStore = require("./libs/sessionStore");

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

var MongoStore = require('connect-mongo')(express);

app.use(express.session({
    secret:"WhoIsWho",
    key: config.get('session:key'),
    cookie: config.get('session:cookie'),
    store: sessionStore
}));


app.use(require("./middleware/sendHttpError"));
app.use(require("./middleware/loadUser"));

app.use(express.static(path.join(__dirname, './public')));

app.use(app.router);

require("./routes")(app);

app.use(function(err, req, res, next){
    if(typeof err == 'number') {
        err = new HttpError(err);
    }
    
    if(err instanceof HttpError){
        res.sendHttpError(err);
    }else {
        if(app.get('env') == 'development'){
            express.errorHandler()(err, req, res, next);
        }else{
            log.error(err);
            err = new HttpError(500);
            res.sendHttpError(err);
        }
    }
});

var server = http.createServer(app);


server.listen(app.get('port'), function(){
  log.info('Express server listening on port ' + app.get('port'));
});

var io = require('./socket')(server);