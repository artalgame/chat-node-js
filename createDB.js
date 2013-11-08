var mongoose = require("./libs/mongoose");
mongoose.set('debug', true);
var async = require('async');

async.series([
    open,
    dropDatabase,
    requireModels,
    createUsers
], function(err, results){
    mongoose.disconnect();
});

function open(callback){
    mongoose.connection.on('open', callback);
}

function dropDatabase(callback){
    var db = mongoose.connection.db;
    db.dropDatabase(callback);
}

function requireModels(callback){
    require("./models/user");
    
    async.each(Object.keys(mongoose.models), function(modelName, callback){
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}

function createUsers(callback){
    
    var users = [
        {username: 'Vasya', password: 'supervasya'},
        {username: 'Petya', password: '123'},
        {username: 'admin', password: '123'}
        ];
    async.each(users, function(modelName, callback) {
        var user = new mongoose.models.User(modelName);
        user.save(callback);
    }, callback);
}