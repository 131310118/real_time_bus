/**
 * Created by wangj on 2017/2/27.
 */

var http = require('http');
var url = require('url');
var route = require('./route');
var db = require('./db');

db.connectDB();

http.createServer((req, res) => {
    var urlObj = url.parse(req.url);
    //var pathname = url.parse(req.url).pathname;
    console.log('Request for ' + urlObj.pathname + ' received.');
    route.route(urlObj, req, res);
}).listen(8082);
console.log('Server has started.');

