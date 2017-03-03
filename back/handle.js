/**
 * Created by wangj on 2017/2/27.
 */
var querystring = require('querystring');
var http = require('http');
var https = require('https');
var db = require('./db');

function search(urlObj, req, res) {
    var query = querystring.parse(urlObj.query);
    if(query.searchName !== undefined) {
        db.isKeywordNotExist(query.searchName, function(data) {
            if(!data) {
                db.searchByKeyword(query.searchName, function(data) {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(data));
                });
                return;
            }
            https.get(`https://restapi.amap.com/v3/bus/linename?offset=142&keywords=${encodeURI(query.searchName)}&key=76b61c311cd340081bc9379b96f547d6&extensions=all&city=shanghai&s=rsv3`, (data) => {
                if(data.statusCode !== 200) {
                    res.writeHead(406, {'Content-Type': 'application/json'});
                    res.end('{"status": 0, "log": "未找到相关信息"}');
                } else if(!/^application\/json/.test(data.headers['content-type'])) {
                    res.writeHead(406, {'Content-Type': 'application/json'});
                    res.end('{"status": 0, "log": "请联系管理员"}');
                } else {
                    data.setEncoding('utf8');
                    let rawData = '';
                    data.on('data', (chunk) => rawData += chunk);
                    data.on('end', () => {
                        try {
                            let parsedData = JSON.parse(rawData);
                            console.log(parsedData);
                            let resData = [];
                            for(let busLine of parsedData.buslines) {
                                if(busLine.type === '普通公交') {
                                    db.insertLine(busLine);
                                    resData.push(busLine);
                                }
                            }
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({data: resData}));
                        } catch(e) {
                            console.log(e.message);
                        }
                    });
                }
            }).on('error', (e) => {
                console.log(`Got error: ${e.massage}`);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end('{"status": 0, "log": "请稍后再试"}');
            })
        });
    } else {
        res.writeHead(406, {'Content-Type': 'application/json'});
        res.end('{"status": 0, "log": "参数有误"}')
    }
}

function getBusBase(urlObj, req, res) {
    var query = querystring.parse(urlObj.query);
    if(query.name !== undefined) {
        let url = `https://apps.eshimin.com/traffic/gjc/getBusBase?name=${encodeURI(query.name)}`;
        https.get(url, (data) => {
            if(data.statusCode !== 200) {
                res.writeHead(406, {'Content-Type': 'application/json'});
                res.end('{"status": 0, "log": "未找到相关信息"}');
            } else if(!/^application\/json/.test(data.headers['content-type'])) {
                res.writeHead(406, {'Content-Type': 'application/json'});
                res.end('{"status": 0, "log": "请联系管理员"}');
            } else {
                data.setEncoding('utf8');
                let rawData = '';
                data.on('data', (chunk) => rawData += chunk);
                data.on('end', () => {
                    console.log(rawData);
                    try {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(rawData);
                    } catch(e) {
                        console.log(e.message);
                    }
                });
            }
        }).on('error', (e) => {
            console.log(`Got error: ${e.massage}`);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end('{"status": 0, "log": "请稍后再试"}');
        });
    } else {
        res.writeHead(406, {'Content-Type': 'application/json'});
        res.end('{"status": 0, "log": "参数有误"}')
    }
}

function getBusStop(urlObj, req, res) {
    var query = querystring.parse(urlObj.query);
    if(query.name !== undefined) {
        let url = `https://apps.eshimin.com/traffic/gjc/getBusStop?name=${encodeURI(query.name)}&lineid=${query.lineid}}`;
        https.get(url, (data) => {
            if(data.statusCode !== 200) {
                res.writeHead(406, {'Content-Type': 'application/json'});
                res.end('{"status": 0, "log": "未找到相关信息"}');
            } else if(!/^application\/json/.test(data.headers['content-type'])) {
                res.writeHead(406, {'Content-Type': 'application/json'});
                res.end('{"status": 0, "log": "请联系管理员"}');
            } else {
                data.setEncoding('utf8');
                let rawData = '';
                data.on('data', (chunk) => rawData += chunk);
                data.on('end', () => {
                    console.log(rawData);
                    try {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(rawData);
                    } catch(e) {
                        console.log(e.message);
                    }
                });
            }
        }).on('error', (e) => {
            console.log(`Got error: ${e.massage}`);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end('{"status": 0, "log": "请稍后再试"}');
        });
    } else {
        res.writeHead(406, {'Content-Type': 'application/json'});
        res.end('{"status": 0, "log": "参数有误"}')
    }
}

function getBusStop(urlObj, req, res) {
    var query = querystring.parse(urlObj.query);
    if(query.name !== undefined) {
        let url = `https://apps.eshimin.com/traffic/gjc/getBusStop?name=${encodeURI(query.name)}&lineid=${query.lineid}}`;
        https.get(url, (data) => {
            if(data.statusCode !== 200) {
                res.writeHead(406, {'Content-Type': 'application/json'});
                res.end('{"status": 0, "log": "未找到相关信息"}');
            } else if(!/^application\/json/.test(data.headers['content-type'])) {
                res.writeHead(406, {'Content-Type': 'application/json'});
                res.end('{"status": 0, "log": "请联系管理员"}');
            } else {
                data.setEncoding('utf8');
                let rawData = '';
                data.on('data', (chunk) => rawData += chunk);
                data.on('end', () => {
                    console.log(rawData);
                    try {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(rawData);
                    } catch(e) {
                        console.log(e.message);
                    }
                });
            }
        }).on('error', (e) => {
            console.log(`Got error: ${e.massage}`);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end('{"status": 0, "log": "请稍后再试"}');
        });
    } else {
        res.writeHead(406, {'Content-Type': 'application/json'});
        res.end('{"status": 0, "log": "参数有误"}')
    }
}

function getArriveBase(urlObj, req, res) {
    var query = querystring.parse(urlObj.query);
    if(query.name !== undefined) {
        let url = `https://apps.eshimin.com/traffic/gjc/getArriveBase?name=${encodeURI(query.name)}&lineid=${query.lineid}&stopid=${query.stopid}&direction=${query.direction}`;
        console.log(url);
        https.get(url, (data) => {
            if(data.statusCode !== 200) {
                res.writeHead(406, {'Content-Type': 'application/json'});
                res.end('{"status": 0, "log": "未找到相关信息"}');
            } else if(!/^application\/json/.test(data.headers['content-type'])) {
                res.writeHead(406, {'Content-Type': 'application/json'});
                res.end('{"status": 0, "log": "请联系管理员"}');
            } else {
                data.setEncoding('utf8');
                let rawData = '';
                data.on('data', (chunk) => rawData += chunk);
                data.on('end', () => {
                    console.log(rawData);
                    try {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(rawData);
                    } catch(e) {
                        console.log(e.message);
                    }
                });
            }
        }).on('error', (e) => {
            console.log(`Got error: ${e.massage}`);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end('{"status": 0, "log": "请稍后再试"}');
        });
    } else {
        res.writeHead(406, {'Content-Type': 'application/json'});
        res.end('{"status": 0, "log": "参数有误"}')
    }
}

exports.search = search;
exports.getBusBase = getBusBase;
exports.getBusStop = getBusStop;
exports.getArriveBase = getArriveBase;

