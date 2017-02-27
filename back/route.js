/**
 * Created by wangj on 2017/2/27.
 */

var handle = require('./handle');
function route(urlObj, req, res) {
    switch (urlObj.pathname) {
        case '/api/search':
            handle.search(urlObj, req, res);
    }
}

exports.route = route;