/**
 * Created by wangj on 2017/2/27.
 */

var handle = require('./handle');
function route(urlObj, req, res) {
    switch (urlObj.pathname) {
        case '/api/search':
            handle.search(urlObj, req, res);
            return;
        case '/api/getBusBase':
            handle.getBusBase(urlObj, req, res);
            return;
        case '/api/getBusStop':
            handle.getBusStop(urlObj, req, res);
            return;
        case '/api/getArriveBase':
            handle.getArriveBase(urlObj, req, res);
            return;
    }
}

exports.route = route;