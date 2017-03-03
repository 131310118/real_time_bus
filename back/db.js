/**
 * Created by wangj on 2017/2/27.
 */

var MongoClient = require('mongodb').MongoClient;
var mongo = new MongoClient();
var myDB = null;

function connectDB() {
    mongo.connect('mongodb://wangjun:123zxcasd@localhost:27017/realtimebus', function(err, db) {
        myDB = db;
    });
}

function isKeywordNotExist(name, callback) {
    myDB.collection('keywords', function(err, collection) {
        collection.findOne({'keyword': name}, function(err, item) {
            if(item) {
                callback(false);
                return;
            }
            callback(true);
        })
    })
}

function searchByKeyword(name, callback) {
    myDB.collection('lines', function(err, collection) {
        collection.find({name: {$regex: name}}).limit(10).toArray().then(function(data) {
            callback(data);
        })
    })
}

function insertLine(line) {
    myDB.collection('lines', function(err, collection) {
        collection.insertOne(line, function(err, data) {
        });
    })
}

exports.connectDB = connectDB;
exports.isKeywordNotExist = isKeywordNotExist;
exports.searchByKeyword = searchByKeyword;
exports.insertLine = insertLine;