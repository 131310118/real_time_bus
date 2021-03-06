/**
* Created by 王军 on 2017/4/6.
*/
!function(obj) {
    obj.formatParam = function(data){
        var arr = [];
        for(var name in data){
            arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
        }
        return arr.join('&');
    };
    obj.ajax = function(option){
        var xhr = new XMLHttpRequest();
        if(option.type.toLowerCase()=='get'){
            if(option.data){
                xhr.open('get',option.url+'?' + this.formatParam(option.data),true);
            }else{
                xhr.open('get',option.url,true);
            }
            xhr.send(null);
        }else if(option.type.toLowerCase()=='post'){
            xhr.open('post',option.url,true);
            xhr.send(this.formatParam(option.data));
        }
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4){
                if(xhr.status == 200){
                    if(option.dataType && option.dataType.toLowerCase() == 'json'){
                        option.success && option.success(JSON.parse(xhr.response));
                    }else{
                        option.success && option.success(JSON.parse(xhr.response));
                    }
                }else{
                    option.error && option.error(xhr);
                }
                option.complete && option.complete(xhr);
            }
        };
    };
    obj.trim = function(str) {
        return str.replace(/(^\s*)|(\s*$)/g, '');
    };
    obj.merge = function(o, n) {
        for(var key in n) {
            if(o[key] === undefined) {
                o[key] = n[key];
            } else if(Object.prototype.toString.call(o[key]) === '[object Object]') {
                o[key] = obj.merge(o[key], n[key]);
            }
        }
        return o;
    };
    obj.parseMsToTime = function(s){
        var str = '';
        var mi = Math.floor(s / 60);
        var s = mi % 60;
        var h = 0;
        if(mi >= 60) {
            h = Math.floor(mi / 60);
            mi = mi % 60;
        }
        if(h > 0) {
            str += h + '时';
        }
        if(mi > 0) {
            str += mi + '分';
        }
        str += s + '秒到达';
        return str;
    };
    obj.hasClass = function(node, className) {
        if((new RegExp('(^| )' + className + '( |$)')).test(node.className)) {
            return true;
        }
        return false;
    };
    obj.addClass = function(node, className) {
        if(!this.hasClass(node, className)) {
            node.className = this.trim(node.className) + ' ' + className;
        }
    };
    obj.removeClass = function(node, className) {
        var reg = new RegExp('(^| )' + className + '( |$)');
        if(this.hasClass(node, className)) {
            node.className = this.trim(node.className.replace(reg, ' '));
        }
    };
}(window.tools = window.tools || {});
!function(obj) {
    obj.GD = {
        map: (function(){
            var map = new AMap.Map('container', {
                resizeEnable: true,
                //rotateEnable: true,
                zoom: 15
            });
            map.on('mousedown', function() {
                if(obj.dom && obj.dom.searchBody) {
                    obj.dom.searchBody.className = 'hiden';
                }
            });
            return map;
        })()
    };//地图模块
    obj.nearBy = {
        searchNearByContent: (function(){
            var searchNearByButton = document.createElement('div'); //周边查询按钮
            searchNearByButton.innerHTML = '搜索周边站点';
            searchNearByButton.className = 'rtb_nearBy_point ';
            searchNearByButton.addEventListener('click', function(e) {
                var p = obj.nearBy.searchNearByMarker.getPosition();
                obj.nearBy.nearStops.lnglat = p;
                obj.nearBy.getStops({
                    location: p.getLng() + ',' + p.getLat(),
                    radius: obj.user.radius,
                    position: p
                });
                obj.dom.handleEvent.getStopStart();
            });
            return searchNearByButton;
        })(),
        stopContent: (function() {
            var content = document.createElement('div');
            content.className = 'rtb_point ';
            var content_title = document.createElement('div');
            var content_content = document.createElement('div');
            content.appendChild((function() {
                var dom = document.createElement('div');
                dom.className = 'rtb_point_info';
                content_title.className = 'rtb_point_info_title';
                content_content.className = 'rtb_point_info_content';
                dom.appendChild(content_title);
                dom.appendChild(content_content);
                return dom;
            })());
            content.appendChild((function() {
                var rtb_point_close = document.createElement('div');//关闭窗口按钮
                rtb_point_close.className = 'rtb_point_close';
                rtb_point_close.innerHTML = 'x';
                rtb_point_close.addEventListener('click', function() {
                    obj.nearBy.stopWindow.close();
                });
                return rtb_point_close;
            })());
            content.appendChild((function() {
                var sharp = document.createElement('span');
                sharp.className = 'rtb_point_sharp';
                return sharp;
            })());
            content.addEventListener('click', function(e) {
                if(e.target && e.target.className.includes('rtb_point_busLine')) {
                    obj.nearBy.hideBusStation(); //隐藏周边组件
                    obj.line.lineSearch(e.target.title, obj.nearBy.stopInfo.name.match(/[^(]*/)[0], 1, 2, obj.line.lineSearch_Callback.bind(obj.line), null); //公交线路查询
                }
            });
            return {
                content: content,
                content_title: content_title,
                content_content: content_content
            };
        })()
    }
}(window.realTimeBus = window.realTimeBus || {});
!function(obj) {
    obj.nearBy = window.tools.merge({
        stopInfo: null,
        isSearchNearBy: true,
        searchNearByMarker: new AMap.Marker({
            map: obj.GD.map,
            icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png"
        }),
        stopWindow: new AMap.InfoWindow({
            isCustom: true
        }),
        busStations: [],//保存附近公交站点[marker]
        nearStops: (function() {
            return {
                lnglat: new AMap.LngLat(121.438408, 31.280004),
                pois: []
            }
        })(),
        activeMacker: null,
        hideBusStation: function() {
            this.busStations.forEach(function(s) {s.hide();});
            obj.dom.busInfoBox.className = 'hiden';
            this.stopWindow.close();
        },
        showBusStation: function() {
            this.busStations.forEach(function(s) {s.show();});
            obj.dom.busInfoBox.className = '';
            this.stopWindow.open(obj.GD.map, this.activeMacker.getPosition());
        },
        handleStopMarkerClick: function(e) {
            if(e.target.getExtData().name === window.tools.trim(obj.dom.busInfoBox.innerText)) {
                this.stopWindow.open(obj.GD.map);
                return;
            }
            this.isSearchNearBy = false;
            this.searchNearByMarker.hide();
            this.searchNearByWindow.close();

            var data = e.target.getExtData();
            obj.dom.busInfoBox.innerHTML = '<p>' + data.name + '</p>';
            obj.user.stopName = data.name;
            obj.dom.busInfoBox.className = '';
            obj.dom.stationLines.className = '';
            obj.dom.stationLines.innerHTML = '';

            var arr =data.address.split(';');
            if(this.activeMacker) {
                this.activeMacker.setContent('<i class="fa fa-map-marker  fa-3x" style="color: #0f89f5"></i>');
            }
            e.target.setContent('<i class="fa fa-map-marker  fa-3x" style="color: #f34234"></i>');
            this.activeMacker = e.target;
            this.stopInfo = data;
            this.stopContent.content_title.innerHTML = data.name;
            this.stopContent.content_content.innerHTML = '途经公交车：' + (function(){var str = "";arr.forEach(function(d){str += ('<a class="rtb_point_busLine" title="' + d + '">' + d + '</a>')});return str})();
            this.stopWindow.setContent(this.stopContent.content);
            this.stopWindow.open(obj.GD.map, e.target.getPosition());
            obj.dom.stationLines.innerHTML = '';
            obj.dom.stationLines.className = '';
            var callback = obj.dom.handleEvent.updateLine();
            for(var line of arr) {
                obj.line.lineSearch(line, data.name.replace('(公交站)', ''), 1, 2, callback, null)
            }
        },
        searchNearBy: function() {
            var that = this;
            obj.GD.map.on('click', function(e) {
                if(!that.isSearchNearBy) {
                    that.isSearchNearBy = true;
                    return;
                }
                that.searchNearByMarker.show();
                that.searchNearByWindow.open(obj.GD.map, e.lnglat);
                that.searchNearByMarker.setPosition(e.lnglat);
            })
        },
        getStops: function(o) {
            var that = this;
            //获取周边公交站点
            window.tools.ajax({
                type: 'get',
                url: 'https://restapi.amap.com/v3/place/around',
                data: {
                    location: o.location,
                    key: '79a781fd5bc34c9c04a50d241db792c9',
                    types: '150700|150701|150702|150703|150800',
                    //keywords: '公交',
                    city: 'shanghai',
                    radius: o.radius,
                    sortrule: 'distance',
                    offset: 20,
                    page: 1,
                    output: 'JSON'
                },
                success: function(data) {
                    var i = 0;
                    //描点
                    for(var busStation of data.pois) {
                        if(i < that.busStations.length) {
                            that.busStations[i].show();
                            that.busStations[i].setPosition(new AMap.LngLat(busStation.location.split(',')[0], busStation.location.split(',')[1]));
                            that.busStations[i].setExtData(busStation);
                        } else {
                            var marker = new AMap.Marker({
                                //icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                                content: '<i class="fa fa-map-marker  fa-3x" style="color: #0f89f5"></i>',
                                position: busStation.location.split(','),
                                clickable: true,
                                map: obj.GD.map,
                                zIndex: 100,
                                extData: busStation,
                                bubble: false
                            });
                            that.busStations.push(marker);
                            marker.setMap(obj.GD.map);
                            AMap.event.addListener(marker, 'click', that.handleStopMarkerClick.bind(that));
                        }
                        i++;
                    }
                    var j = i;
                    for(;i < that.busStations.length; i++) {
                        that.busStations[i].hide();
                    }
                    that.busStations.length = j;
                    that.handleStopMarkerClick({
                        target: that.busStations[0]
                    });
                    that.isSearchNearBy = true;
                    obj.GD.map.setFitView(that.busStations.concat(that.stopWindow));
                }
            });
        }
    },obj.nearBy);
    obj.line = {
        busLineId : null, //保存当前公交id
        busLineIds: {}, //公交id缓存
        busLines : {}, //保存公交线路信息
        busline : null, //保存当前所在公交路线简称（非单向）
        busName : null, //保存当前所在单向公交路线
        dirctionReady : [], //是否确定公交方向
        busDirection : [], //当前公交方向
        linesearchInfo : {}, //公交线路查询结果dom缓存
        isSingleLine : [], //是否是单向线路
        linesearch: new AMap.LineSearch({
            pageIndex: 1,
            city: 'shanghai',
            pageSize: 2,
            extensions: 'all'
        }),//公交线路查询服务
        /*
         公交线路查询
         bus: string 公交名称
         name: string 站点名称
         */
        lineSearch: function(bus, name, page, pageSize, success, error) {
            this.linesearch.setPageIndex(page);
            this.linesearch.setPageSize(pageSize);
            this.linesearch.search(bus, function(status, result) {
                if(status === 'complete' && result.info === 'OK') {
                    success(result, bus, name);
                } else {
                    success([], bus);
                }
            });
        },
        /*
         公交线路查询结果处理
         data: object 公交线路查询结果
         bus: string 搜索公交名
         name string 站点名称
         isDirctionReady boolean 是否确定方向
         map.setFitView boolean 地图是否自适应
         */
        lineSearch_Callback:  function(data, bus, name, isDirctionReady, setFitView) {
            var that = this;
            this.handleLineData(data, bus, name, isDirctionReady, setFitView, function() {
                if(that.busDirection[bus] === undefined) {
                    that.busDirection[bus] = 0;
                    name = '';
                }
                var lineArr = data.lineInfo;
                var lineNum = lineArr.length;
                if(lineNum == 0) {
                } else {
                    var pathArr = lineArr[that.busDirection[bus]].path;
                    var stops = lineArr[that.busDirection[bus]].via_stops;
                    var startPot = stops[0].location;
                    var endPot = stops[stops.length - 1].location;
                    that.busName = lineArr[that.busDirection[bus]].name;
                    that.drawbusLine(startPot, endPot, pathArr, stops, name, setFitView);
                }
            });
        },
        handleLineData: function(data, bus, name, isDirctionReady, setFitView, callback) {
            var result = data;
            var that = this;
            data = data.lineInfo;
            //获取公交id
            window.tools.ajax({
                url: './api/getBusBase',
                type: 'get',
                data: {
                    name: bus
                },
                success: function(lineInfo) {
                    if(lineInfo.line_id) {
                        that.busLineId = lineInfo.line_id;
                        //获取公交途经站点
                        window.tools.ajax({
                            url: './api/getBusStop',
                            type: 'get',
                            data: {
                                name: bus,
                                lineid: lineInfo.line_id
                            },
                            //数据校正
                            success: function(lines) {
                                //var stops1 = [];
                                var checkData = function(arr) {
                                    var i = 0;
                                    for(var line of data) {
                                        var stop = [];
                                        var differentSD = [];
                                        var differentSMY = [];
                                        var s, g, l, sd, smy;
                                        for(s = 0, l = line.via_stops.length; s < l; s++) {
                                            for(g = 0; g < lines[arr[i]].stops.length; g++) {
                                                if(line.via_stops[s].name === lines[arr[i]].stops[g].zdmc.replace('（', '(').replace('）', ')')) {
                                                    if(!that.dirctionReady[bus] && line.via_stops[s].name === name && !that.isSingleLine[bus]) {
                                                        that.dirctionReady[bus] = true;
                                                        that.busDirection[bus] = (lines[arr[i]].direction === 'false'?0:1);
                                                    } else if(!that.dirctionReady[bus] && that.isSingleLine[bus]) {
                                                        that.dirctionReady[bus] = true;
                                                        that.busDirection[bus] = (lines[arr[i]].direction === 'false'?0:1);
                                                    }
                                                    line.via_stops[s].shiID = lines[arr[i]].stops[g].id; //线路站点id
                                                    stop.push(line.via_stops[s]);
                                                    while (lines[arr[i]].stops[g].id !== lines[arr[i]].stops[0].id) {
                                                        differentSMY.push(lines[arr[i]].stops.splice(0, 1)[0]);
                                                        g--;
                                                    }
                                                    while(differentSMY.length && differentSD.length) {
                                                        sd = differentSD.splice(0, 1);
                                                        smy = differentSMY.splice(0, 1);
                                                        if(!that.dirctionReady[bus] && sd.name === name && !that.isSingleLine[bus]) {
                                                            that.dirctionReady[bus] = true;
                                                            that.busDirection[bus] = (lines[arr[i]].direction === 'false'?0:1);
                                                        }
                                                        sd[0].shiID = smy[0].id; //线路站点id
                                                        stop.splice(-1, 0, sd[0]);
                                                    }
                                                    differentSMY.length = 0;
                                                    differentSD.length = 0;
                                                    lines[arr[i]].stops.splice(0, 1);
                                                    break;
                                                }
                                            }
                                            if(g == lines[arr[i]].stops.length) {
                                                differentSD.push(line.via_stops[s]);
                                            }
                                        }
                                        while(differentSD.length && lines[arr[i]].stops.length) {
                                            sd = differentSD.splice(0, 1);
                                            smy = lines[arr[i]].stops.splice(0, 1);
                                            sd[0].shiID = smy[0].id; //线路站点id
                                            stop.push(sd[0]);
                                        }
                                        that.busLines[bus].lineInfo[i].via_stops = stop; //保存校正后的数据
                                        i++;
                                    }
                                };
                                if(!lines['lineResults1'].stops || !lines['lineResults0'].stops) {
                                    that.lineSearch_Callback(data, bus, name, isDirctionReady, setFitView);
                                    return;
                                }
                                that.busLines[bus] = result; //保存搜索结果
                                that.busline = bus; //保存搜索公交名
                                that.isSingleLine[bus] = (!(lines['lineResults1'].stops.length && lines['lineResults0'].stops.length));
                                that.dirctionReady[bus] = isDirctionReady&&!that.isSingleLine[bus]?true:false;//方向是否确定
                                if(!that.isSingleLine[bus] && data[0].via_stops[0].name !== lines['lineResults1'].stops[0].zdmc.replace('（', '(').replace('）', ')')
                                    && data[0].via_stops[data[0].via_stops.length - 1].name !== lines['lineResults1'].stops[lines['lineResults1'].stops.length - 1].zdmc.replace('（', '(').replace('）', ')')) {
                                    data = data.reverse();
                                } else if(that.isSingleLine[bus]) {
                                    if(!lines['lineResults1'].stops.length && data.length > 1) {
                                        data = data.reverse();
                                    } else if(!lines['lineResults1'].stops.length && data.length == 1) {
                                        data[1] = JSON.parse(JSON.stringify(data[0]));
                                    }
                                }
                                checkData(['lineResults1', 'lineResults0']);
                                callback();
                            },
                            error: function() {
                                console.log('稍后再试');
                            }
                        });
                    }
                }
            });
        },
        /*
         实时公交绘图
         startPot: object 起点
         endPot: object 终点
         BusArr: array 路径数组
         stops: array 途经站点
         stopName: string 站点名
         setFitView: boolean 地图是否自适应
         */
        drawbusLine: function(startPot, endPot, BusArr, stops, stopName, setFitView) {
            var that = this;
            if(obj.realTimeStation.activeBusMarker && obj.realTimeStation.activeBusMarker.getContent()) {
                obj.realTimeStation.activeBusMarker.setContent('<i class="fa fa-circle" style="color: #534cef"></i>')
            }
            obj.realTimeStation.activeBusMarker = null;
            if(this.linesearchInfo.start) {
                this.linesearchInfo.start.setPosition(new AMap.LngLat(startPot.lng, startPot.lat))
            } else {
                this.linesearchInfo.start = new AMap.Marker({
                    map: obj.GD.map,
                    position: [startPot.lng, startPot.lat],
                    icon: new AMap.Icon({
                        size: new AMap.Size(40, 50),  //图标大小
                        image: "./img/start.png"
                    }),
                    zIndex: 200,
                    extData: {
                        stopid: 1,
                        info: stops[0],
                        index: 0
                    }
                });
                this.linesearchInfo.start.on('click', obj.realTimeStation.updateByDomClick.bind(obj.realTimeStation));
            }
            this.linesearchInfo.start.show();

            //终点
            if(this.linesearchInfo.end) {
                this.linesearchInfo.end.setPosition(new AMap.LngLat(endPot.lng, endPot.lat));
                this.linesearchInfo.end.setExtData({
                    stopid: stops.length,
                    info: stops[stops.length - 1],
                    index: stops.length - 1
                })
            } else {
                this.linesearchInfo.end = new AMap.Marker({
                    map: obj.GD.map,
                    position: [endPot.lng, endPot.lat],
                    icon: new AMap.Icon({
                        size: new AMap.Size(40, 50),  //图标大小
                        image: "./img/end.png"
                    }),
                    zIndex: 200,
                    extData: {
                        stopid: stops.length,
                        info: stops[stops.length - 1],
                        index: stops.length - 1
                    }
                });
                this.linesearchInfo.end.on('click', obj.realTimeStation.updateByDomClick.bind(obj.realTimeStation));
            }
            this.linesearchInfo.end.show();

            //线路
            this.linesearchInfo.busPolyline?this.linesearchInfo.busPolyline.setPath(BusArr):this.linesearchInfo.busPolyline = new AMap.Polyline({
                map: obj.GD.map,
                path: BusArr,
                strokeColoe: '#09f',
                strokeOpacity: 0.8,
                strokeWeight:6
            });
            this.linesearchInfo.busPolyline.show();
            //map.setFitView(); //地图自适应

            //途经站点
            if(this.linesearchInfo.markerCache) {
                if(this.linesearchInfo.markerCache.length > stops.length - 2) {
                    setLinePosition(stops.length - 2, 0, stops);
                } else {
                    setLinePosition(this.linesearchInfo.markerCache.length, stops.length - 2 - this.linesearchInfo.markerCache.length, stops);
                }
            } else {
                setLinePosition(0, stops.length - 2, stops);
            }

            function setLinePosition(old, n, stops) {
                if(that.linesearchInfo.stops === undefined) {
                    that.linesearchInfo.stops = [];
                }
                that.linesearchInfo.stops.length = 0;
                //marker缓冲池
                if(that.linesearchInfo.markerCache === undefined) {
                    that.linesearchInfo.markerCache = [];
                }
                var i = 1;
                for(var stop of that.linesearchInfo.markerCache) {
                    if(i <= old) {
                        stop.show();
                        stop.setPosition(new AMap.LngLat(stops[i].location.lng, stops[i].location.lat));
                        stop.setExtData({
                            stopid: stops[i].shiID,
                            info: stops[i],
                            index: i
                        });
                        that.linesearchInfo.stops.push(stop);
                    } else {
                        stop.hide();
                    }
                    i++;
                }
                var l = old + 1;
                while(n--) {
                    var marker = new AMap.Marker({
                        map: obj.GD.map,
                        position: [stops[i].location.lng, stops[i].location.lat],
                        //content: '<div class="rtb_point_stop"></div>',
                        content: '<i class="fa fa-circle" style="color: #534cef"></i>',
                        zIndex: 150,
                        offset: new AMap.Pixel(-6, -6),
                        extData: {
                            stopid: stops[i].shiID,
                            info: stops[i],
                            index: l++
                        }
                    });
                    marker.on('click', obj.realTimeStation.updateByDomClick.bind(obj.realTimeStation));
                    that.linesearchInfo.stops.push(marker);
                    that.linesearchInfo.markerCache.push(marker);
                    i++;
                }
                if(setFitView) {
                    obj.GD.map.setFitView(); //地图自适应
                }
            }

            if(this.linesearchInfo.start.getExtData().info.name === stopName) {
                this.linesearchInfo.start.emit('click', {
                    target: this.linesearchInfo.start
                })
            } else if(this.linesearchInfo.end.getExtData().info.name === stopName) {
                this.linesearchInfo.end.emit('click', {
                    target: this.linesearchInfo.end
                })
            } else {
                for(var j = stops.length - 2, i = 0; i < j; i++) {
                    if(this.linesearchInfo.stops[i].getExtData().info.name === stopName) {
                        this.linesearchInfo.stops[i].emit('click', {
                            target: this.linesearchInfo.stops[i]
                        });
                        return;
                    }
                }
                window.tools.addClass(obj.dom.stationNav, 'hiden');
            }
        },
        switchBusDirection: function() {
            if(obj.realTimeStation.activeBusMarker) {
                obj.realTimeStation.activeBusMarker.setContent('<i class="fa fa-circle" style="color: #534cef"></i>');
            }
            this.busDirection[this.busline]  = (this.busDirection[this.busline] == 1?0:1);
            if(this.isSingleLine[this.busline]) {
                return;
            }
            obj.realTimeStation.infoWindow.close();
            var lineArr = this.busLines[this.busline].lineInfo;
            var lineNum = this.busLines[this.busline].lineInfo.length;
            if(lineNum == 0) {
            } else {
                var pathArr = lineArr[this.busDirection[this.busline]].path;
                var stops = lineArr[this.busDirection[this.busline]].via_stops;
                var startPot = stops[0].location;
                var endPot = stops[stops.length - 1].location;
                this.busName =  lineArr[this.busDirection[this.busline]].name;
                if(!window.tools.hasClass(obj.dom.realTimeStation, 'hiden')) {
                    var point = lineArr[this.busDirection[this.busline]];
                    obj.dom.handleEvent.updateBusLine({
                        start: point.start_stop,
                        end: point.end_stop,
                        first: point.stime.slice(0, 2) + ':' + point.stime.slice(2),
                        last: point.etime.slice(0, 2) + ':' + point.etime.slice(2),
                        money: point.basic_price + '-' + point.total_price
                    });
                    window.tools.addClass(obj.dom.realTimeInfo, 'hiden');
                    obj.dom.judgePosition();
                }
                this.drawbusLine(startPot, endPot, pathArr, stops, obj.user.stopName);
            }
        },
        hideLineInfo: function() {
            obj.realTimeStation.infoWindow.close();
            for(var item of Object.values(obj.line.linesearchInfo)) {
                if(item instanceof Array) {
                    for(var marker of item) {
                        marker.hide();
                    }
                } else {
                    item.hide();
                }
            }
        },
        goBackNearBy: function() {
            this.hideLineInfo();
            obj.nearBy.searchNearByMarker.hide();
            obj.nearBy.showBusStation();
            window.tools.removeClass(obj.dom.stationLines, 'hiden');
            window.tools.addClass(obj.dom.realTimeStation, 'hiden');
            window.tools.addClass(obj.dom.realTimeInfo, 'hiden');
            obj.nearBy.busStations[0].emit('click', {
                target: obj.nearBy.busStations[0]
            });
            obj.dom.judgePosition();
            obj.GD.map.setFitView(); //地图自适应
        }
    };
    obj.realTimeStation = {
        infoWindow: new AMap.InfoWindow({
            isCustom: true
        }), //实时到站信息窗口
        activeBusMarker: null, //实时公交活跃站点
        stopid: null, //实时公交活跃站点第几站点,
        lastGetTime: [], //上一次获取的实时公交时间
        lastBusData: [], //上一次获取的实时公交数据
        updateByDomClick: function(e) {
            var that = this;
            if(this.activeBusMarker !== e.target) {
                if(this.activeBusMarker && this.activeBusMarker.getContent()) {
                    this.activeBusMarker.setContent('<i class="fa fa-circle" style="color: #534cef"></i>')
                }
                if(e.target.getContent()) {
                    e.target.setContent('<i class="fa fa-circle" style="color: #f34234"></i>');
                }
                this.activeBusMarker = e.target;
            }
            var expire = 100000;
            var extData = e.target.getExtData();
            this.stopid = extData.stopid;
            obj.user.stopName = extData.info.name;
            obj.dom.handleEvent.updateStation({
                station: obj.user.stopName
            });
            obj.GD.map.setCenter(e.target.getPosition());
            //window.tools.removeClass(obj.dom.stationNav, 'hiden');
            if (this.lastGetTime[this.stopid] && this.lastGetTime[this.stopid][obj.line.busDirection[obj.line.busline]]) {
                expire = new Date() * 1 - this.lastGetTime[this.stopid][obj.line.busDirection[obj.line.busline]];
            }
            if (expire < 10000) {
                //更新实时公交dom数据
                this.updateRealBus(this.lastBusData[this.stopid][obj.line.busDirection[obj.line.busline]], expire, e.target, obj.line.busName);
            } else {
                var isDirectionReady = setInterval(function () {
                    if (obj.line.dirctionReady[obj.line.busline]) {
                        clearInterval(isDirectionReady);
                        //获取实时公交数据并更新dom数据
                        window.tools.ajax({
                            url: './api/getArriveBase',
                            type: 'get',
                            data: {
                                name: obj.line.busline,
                                lineid: obj.line.busLineId,
                                direction: obj.line.busDirection[obj.line.busline],
                                stopid: that.stopid
                            },
                            success: function (data) {
                                if(!that.lastGetTime[that.stopid]) {
                                    that.lastGetTime[that.stopid] = [];
                                }
                                that.lastGetTime[that.stopid][obj.line.busDirection[obj.line.busline]] = new Date() * 1;
                                that.updateRealBus(data, 0, e.target, e.target);
                                if(!that.lastBusData[that.stopid]) {
                                    that.lastBusData[that.stopid] = [];
                                }
                                that.lastBusData[that.stopid][obj.line.busDirection[obj.line.busline]] = data;
                            }
                        });
                    }
                }, 50);
            }
        },
        updateRealBus: function(data, expire, marker) {
            var that = this;
            var info = document.createElement('div');
            var infoContent = document.createElement('div');
            infoContent.className = 'rtb_marker_info';
            if(data.cars && data.cars.length) {
                infoContent.innerHTML = '<span class="rtb_highlight">' + obj.line.busName + '</span> ·\
                        <span class="rtb_highlight">' + data.cars[0].stopdis + '</span> 站后到达·\
                        <span class="rtb_highlight">' + marker.getExtData().info.name + '</span> ·约\
                        <span class="rtb_highlight">' + Math.floor((data.cars[0].time > expire / 1000?data.cars[0].time - expire / 1000:0) / 60) + '</span> 分钟·车牌号\
                        <span class="rtb_highlight">' + data.cars[0].terminal + '</span>\
                    ';
                obj.dom.handleEvent.updateRealTimeStation({
                    distence: data.cars[0].distance + '米',
                    stops: data.cars[0].stopdis + '站',
                    id: data.cars[0].terminal,
                    time: window.tools.parseMsToTime(data.cars[0].time > expire / 1000?data.cars[0].time - expire / 1000:0)
                });
                obj.dom.judgePosition();
                obj.dom.handleEvent.updateFooter && obj.dom.handleEvent.updateFooter({da:data});
            } else {
                infoContent.innerHTML = '<span class="rtb_highlight">' + obj.line.busName + '</span> ·\
                        <span class="rtb_highlight">' + marker.getExtData().info.name + '</span>\
                        <span class="rtb_highlight">暂无数据</span>\
                    ';
                window.tools.addClass(obj.dom.realTimeInfo, 'hiden');
                obj.dom.judgePosition();
                obj.dom.handleEvent.updateFooter && obj.dom.handleEvent.updateFooter();
            }
            var infoSharp = document.createElement('span');
            infoSharp.className = 'rtb_marker_sharp';
            var infoClose = document.createElement('span');
            infoClose.className = 'rtb_point_close';
            infoClose.innerHTML = 'x';
            infoClose.addEventListener('click', function() {
                that.infoWindow.close();
            });
            info.appendChild(infoContent);
            info.appendChild(infoSharp);
            info.appendChild(infoClose);
            that.infoWindow.setContent(info);
            that.infoWindow.open(obj.GD.map, marker.getPosition());
        }
    };
    obj.user = {
        radius: 500, //用户相关配置
        stopName: null //用户当前选中站点名
    };
    obj.search = {
        stationSearch: null,//搜索站点模块
        searchResult: [],
        searchMap: {
            line: [],
            station: [],
            poi: []
        },
        linesMap: [],
        init: function(key) {
            this.searchResult[key] = [];
            this.searchMap.line[key] = {
                number: 0,
                isOver: false
            };
            this.searchMap.station[key] = {
                number: 0,
                isOver: false
            };
            this.searchMap.poi[key] = {
                number: 0,
                isOver: false
            };
        },
        getData: function(page, pageSize, operaterObj, fn, key, type, callback, final) {
            if(!this.searchResult[key]) {
                this.init(key);
            }
            var that = this;
            if(this.searchResult[key].length < (page + 2) * pageSize) {
                if(!operaterObj[key].isOver) {
                    var p = Math.floor(operaterObj[key].number / pageSize) + 1;
                    fn(key, null, p, pageSize * 5, function(result) {
                        if(result.length < pageSize * 5) {
                            operaterObj[key].isOver = true;
                        }
                        result = result.slice(operaterObj.number % pageSize);
                        result.forEach(function(item) {
                            item.smType = type;
                        });
                        operaterObj[key].number += result.length;
                        that.searchResult[key] = that.searchResult[key].concat(result);
                        if(callback) {
                            callback();
                        }
                    }, null)
                }
            } else {
                if(final) {
                    final();
                }
            }
        },
        search: function(bus, page, pageSize) {
            if(!this.searchResult[bus]) {
                this.init(bus);
            }
            var that = this;
            if(this.searchResult[bus].length < (page + 2) * pageSize) {
                if(!this.searchMap.line[bus].isOver) {
                    var p = Math.floor(this.searchMap.line[bus].number / pageSize) + 1;
                    obj.line.lineSearch(bus, null, p, pageSize * 5, function(result) {
                        if(result)  {
                            result = result.lineInfo;
                            if(result.length < pageSize * 5) {
                                that.searchMap.line[bus].isOver = true;
                            }
                            for(var line of result) {
                                var l = line.name.replace(/\(.*\)/, '');
                                if(!that.linesMap[l]) {
                                    var obj = {};
                                    obj.smType = '0';
                                    obj.name = l;
                                    obj.lineInfo = [line];
                                    that.linesMap[l] = obj.lineInfo;
                                    that.searchResult[bus].push(obj);
                                } else {
                                    that.linesMap[l].push(line);
                                }
                            }
                            result = result.slice(that.searchMap.line[bus].number % pageSize);
                            that.searchMap.line[bus].number += result.length;
                        }
                    }, null)
                }
            }
            this.getData(page, pageSize, this.searchMap.station, this.searchStation.bind(this), bus, "1", function() {
                that.getData(page, pageSize, that.searchMap.poi, that.searchPoi, bus, "2", function() {
                    that.show(that.searchResult[bus].slice((page - 1) * pageSize, page * pageSize));
                }, function() {
                    that.show(that.searchResult[bus].slice((page - 1) * pageSize, page * pageSize));
                });
            }, function() {
                that.show(that.searchResult[bus].slice((page - 1) * pageSize, page * pageSize));
            });
        },
        searchStation: function(station, stop, page, pageSize, success, error) {
            var that = this;
            if(this.stationSearch) {
                this.stationSearch.setPageIndex(page);
                this.stationSearch.setPageSize(pageSize);
                this.stationSearch.search(station, function(status, result){
                    //根据status判断是否有正确结果
                    if(status === 'complete' && result.info === 'OK'){
                        console.log(result);
                        result.stationInfo.forEach(function(station) {
                            station.location = station.location.getLng() + ',' + station.location.getLat();
                            station.address = function() {
                                var arr = [];
                                for(var line of station.buslines) {
                                    arr.push(line.name.replace(/\(.*\)/, ''));
                                }
                                return arr.join(';')
                            }()
                        });
                        success(result.stationInfo, station);
                    }else{
                        //查询失败或者没有合适结果
                        success([], station);
                    }
                });
            } else {
                setTimeout(function() {
                    that.searchStation(station, page, pageSize, success, error);
                }, 300);
            }
        },
        searchPoi: function(poi, stop, page, pageSize, success, error) {
            window.tools.ajax({
                type: 'get',
                url: 'https://restapi.amap.com/v3/place/text',
                data: {
                    key: '79a781fd5bc34c9c04a50d241db792c9',
                    keywords: poi,
                    city: 'shanghai',
                    citylimit: true,
                    offset: pageSize,
                    page: page,
                    output: 'JSON'
                },
                success: function(data) {
                    success(data.pois)
                }
            });
        },
        show: function(data) {
            var list = document.createElement('div');
            for(var item of data) {
                var dom = document.createElement('div');
                dom.title = item.name;
                dom.extData = item;
                if(item.smType === "0") {
                    dom.className = 'line';
                    dom.innerHTML = '<i class="fa fa-random"></i>   ' + item.name;
                } else if(item.smType == '1') {
                    dom.className = 'station';
                    dom.innerHTML = '<i class="fa fa-bus"></i>   ' + item.name;
                } else {
                    dom.className = 'poi';
                    dom.innerHTML = '<i class="fa fa-bullseye"></i>   ' + item.name;
                }
                list.appendChild(dom);
            }
            list.addEventListener('click', function(e) {
                var dom = e.target;
                switch(dom.className) {
                    case 'line':
                        obj.dom.busInfoBox.innerText = '';
                        obj.nearBy.hideBusStation();
                        obj.realTimeStation.infoWindow.close();
                        if(window.localStorage) {
                            var search = [];
                            if(localStorage.search) {
                                search = JSON.parse(localStorage.search);
                            }
                            search.unshift({
                                extData: dom.extData,
                                title: dom.title
                            });
                            //search.length = search.length > 5?5:search.length;
                            localStorage.search = JSON.stringify(search);
                        }
                        obj.line.lineSearch_Callback(dom.extData, dom.title, null, true, true);
                        obj.dom.stationLines.innerHTML = '';
                        obj.dom.stationLines.className = '';
                        obj.dom.handleEvent.updateLine()(dom.extData, dom.extData.name, null);
                        break;
                    case 'station':
                        var position = dom.extData.location.split(',');
                        position = new AMap.LngLat(position[0], position[1]);
                        var marker = new AMap.Marker({
                            icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                            position: position,
                            clickable: true,
                            map: obj.GD.map,
                            zIndex: 100,
                            extData: dom.extData,
                            bubble: true,
                            label: {
                                offset: new AMap.Pixel(2, 0)
                            }
                        });
                        AMap.event.addListener(marker, 'click', obj.nearBy.handleStopMarkerClick.bind(obj.nearBy));
                        AMap.event.trigger(marker, 'click', {
                            target: marker
                        });
                        obj.GD.map.setCenter(position);
                        break;
                    case 'poi':
                        var lnglat = dom.extData.location.split(',');
                        lnglat = new AMap.LngLat(lnglat[0], lnglat[1]);
                        obj.nearBy.searchNearByMarker.show();
                        obj.nearBy.searchNearByWindow.open(obj.GD.map, lnglat);
                        obj.nearBy.searchNearByMarker.setPosition(lnglat);
                        obj.GD.map.setCenter(lnglat);
                        break;
                }
                obj.dom.searchBody.className = "hiden";
            });
            obj.dom.searchBody.innerHTML = "";
            obj.dom.searchBody.appendChild(list);
            obj.dom.searchBody.className = "";
        }
    };
    obj.dom = {
        container: document.getElementById('container'),
        searchKeyword: (function() {
            var timeout = null; //搜索定时器
            var searchKeyword = document.getElementById('search_keyword');
            var body = document.getElementsByTagName('body')[0];
            var showSearchListory = function() {
                var search = [];
                var searchMap = {};
                if(window.localStorage) {
                    search = JSON.parse(localStorage.search);
                }
                for(var l = search.length - 1; l >= 0; l--) {
                    if(!searchMap[search[l].title]) {
                        searchMap[search[l].title] = true;
                        search[l] = search[l].extData;
                    } else {
                        search.splice(l, 1);
                    }
                }
                search.length = search.length > 5?5:search.length;
                obj.search.show(search);
            };
            searchKeyword.addEventListener('keydown', function(e) {
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    if(window.tools.trim(searchKeyword.value)) {
                        obj.search.search(searchKeyword.value, 1, 10);
                    } else {
                        //obj.search.show(demoData);
                        //window.tools.addClass(obj.dom.searchBody, 'hiden');
                        showSearchListory();
                    }
                }, 300);
            });
            searchKeyword.addEventListener('focus', function() {
                body.style.height = body.clientHeight + 'px';
                if(searchKeyword.value) {
                    obj.dom.searchBody.className = '';
                } else {
                    //obj.search.show(demoData); //搜索记录
                    //window.tools.addClass(obj.dom.searchBody, 'hiden');
                    showSearchListory();
                }
            });
            searchKeyword.addEventListener('blur', function() {
                setTimeout(function() {
                    window.tools.addClass(obj.dom.searchBody, 'hiden');
                },1000 / 60);
            });
            return searchKeyword;
        })(),
        searchBody: document.getElementById('search_body'),
        back: (function() {
            var back = document.getElementById('back');
            back.addEventListener('click', obj.line.goBackNearBy.bind(obj.line));
            return back;
        })(),
        busInfoBox: document.getElementById('busInfoBox'),
        radius: (function(){
            var radius = document.getElementById('radius');
            var active = document.getElementsByClassName('active')[0];
            radius.addEventListener('click', function(e){
                if(e.target.parentNode === radius && e.target.nodeName === 'LI') {
                    if(active === e.target) {
                        obj.dom.back.click();
                        return;
                    }
                    e.target.className = 'active';
                    if(active) {
                        active.className = '';
                    }
                    active = e.target;
                    var r = e.target.getAttribute('value');
                    obj.nearBy.getStops({
                        location: obj.nearBy.nearStops.lnglat.getLng() + ',' + obj.nearBy.nearStops.lnglat.getLat(),
                        radius: Math.floor(r),
                        position: obj.nearBy.nearStops.lnglat
                    });
                    obj.dom.handleEvent.getStopStart();
                    obj.user.radius = r;

                    /* obj.line.hideLineInfo();
                     obj.nearBy.searchNearByMarker.hide();
                     //obj.nearBy.showBusStation();
                     window.tools.removeClass(obj.dom.stationLines, 'hiden');
                     window.tools.addClass(obj.dom.realTimeStation, 'hiden');
                     window.tools.addClass(obj.dom.realTimeInfo, 'hiden');
                     window.tools.addClass(obj.dom.stationNav, 'hiden');
                     obj.dom.judgePosition();
                     obj.GD.map.setFitView(); //地图自适应*/
                }
            })
        })(),
        stationLines: document.getElementById('stationLines'),
        footer: document.getElementById('footer'),
        judgePosition: (function() {
            var lastTime = 0;
            var timeout = null;
            var amap = null;
            var judgePosition = function() {
                if(!amap) {
                    amap = document.getElementsByClassName('amap-geolocation-con')[0];
                }
                amap.style.bottom = obj.dom.footer.clientHeight + 'px';
                //obj.GD.map.setButtonOffset(new AMap.Pixel(10, 20 + obj.dom.footer.clientHeight));
            };
            return function() {
                var newTime = new Date() * 1;
                if(newTime - lastTime < 200) {
                    clearTimeout(timeout);
                    timeout = setTimeout(judgePosition, 200);
                    return;
                }
                lastTime = newTime;
                timeout = setTimeout(judgePosition, 200);
            }
        })(),
        control: (function() {
            var control = document.getElementById('control');
            var stationLines = document.getElementById('stationLines');
            control.addEventListener('click', function() {
                if(window.tools.hasClass(stationLines, 'more')) {
                    window.tools.removeClass(stationLines, 'more');
                    window.tools.addClass(stationLines, 'less');
                } else {
                    window.tools.removeClass(stationLines, 'less');
                    window.tools.addClass(stationLines, 'more');
                }
                obj.dom.judgePosition();
            })
        })(),
        realTimeStation: (function() {
            var realTimeStation = document.getElementById('realTimeStation');
            var realTimeStationHeaderName = document.getElementById('realTimeStationHeaderName');
            realTimeStationHeaderName.addEventListener('click', function() {
                obj.line.switchBusDirection();
            });
            return realTimeStation;
        })(),
        realTimeInfo: document.getElementById('realTimeInfo'),
        nextStop: (function() {
            var next = document.getElementById('nextStop');
            next.addEventListener('click', function() {
                var index = obj.realTimeStation.activeBusMarker.getExtData().index % (obj.line.linesearchInfo.stops.length + 2);
                if(index == obj.line.linesearchInfo.stops.length) {
                    obj.line.linesearchInfo.end.emit('click', {
                        target: obj.line.linesearchInfo.end
                    });
                    return;
                }
                if(index == obj.line.linesearchInfo.stops.length + 1) {
                    obj.line.linesearchInfo.start.emit('click', {
                        target: obj.line.linesearchInfo.start
                    });
                    return;
                }
                obj.line.linesearchInfo.stops[index].emit('click', {
                    target: obj.line.linesearchInfo.stops[index]
                })
            });
            return next;
        })(),
        lastStop: (function() {
            var last = document.getElementById('lastStop');
            last.addEventListener('click', function() {
                var index = (obj.realTimeStation.activeBusMarker.getExtData().index - 2) % obj.line.linesearchInfo.stops.length;
                if(index == -1) {
                    obj.line.linesearchInfo.start.emit('click', {
                        target: obj.line.linesearchInfo.start
                    });
                    return;
                }
                if(index == -2) {
                    obj.line.linesearchInfo.end.emit('click', {
                        target: obj.line.linesearchInfo.end
                    });
                    return;
                }
                obj.line.linesearchInfo.stops[index].emit('click', {
                    target: obj.line.linesearchInfo.stops[index]
                })
            });
            return last;
        })(),
        stationNav: document.getElementById('stationNav'),
        searchInit: (function() {
            var searchInit = document.getElementById('searchInit');
            searchInit.addEventListener('click', function() {
                obj.dom.searchKeyword.value = '';
                obj.dom.searchKeyword.focus();
            })
        })(),
        handleEvent: {
            updateBusLine: (function() {
                var realTimeStation = document.getElementById('busInfo').children;
                var name = document.getElementById('realTimeStationHeaderName').childNodes[1];
                var start = realTimeStation[0].childNodes[1];
                var end = realTimeStation[1].childNodes[1];
                var first = realTimeStation[2].childNodes[1];
                var last = realTimeStation[3].childNodes[1];
                var money = realTimeStation[4].childNodes[1];
                return function(data) {
                    name.nodeValue = obj.line.busline;
                    start.nodeValue = data.start;
                    end.nodeValue = data.end;
                    first.nodeValue = data.first;
                    last.nodeValue = data.last;
                    money.nodeValue = data.money;
                }
            })(),
            updateRealTimeStation: (function() {
                var realTimeStation = document.getElementById('realTimeStation').children[1].children;
                var distence = realTimeStation[0].children[1].childNodes[0];
                var stops = realTimeStation[1].children[1].childNodes[0];
                var id = realTimeStation[2].children[1].childNodes[0];
                var time = realTimeStation[3].children[1].childNodes[0];
                return function(data) {
                    if(!window.tools.hasClass(obj.dom.realTimeStation, 'hiden')) {
                        window.tools.removeClass(obj.dom.realTimeInfo, 'hiden');
                        distence.nodeValue = data.distence;
                        stops.nodeValue = data.stops;
                        id.nodeValue = data.id;
                        time.nodeValue = data.time;
                    }
                }
            })(),
            updateStation: (function() {
                var station = document.getElementById('footerStationName');
                return function(data) {
                    station.innerHTML = data.station;
                }
            })(),
            getStopStart: function() {
                obj.line.hideLineInfo();
                obj.nearBy.searchNearByMarker.hide();
                //obj.nearBy.showBusStation();
                window.tools.removeClass(obj.dom.stationLines, 'hiden');
                window.tools.addClass(obj.dom.realTimeStation, 'hiden');
                window.tools.addClass(obj.dom.realTimeInfo, 'hiden');
                window.tools.addClass(obj.dom.stationNav, 'hiden');
                obj.dom.judgePosition();
                obj.GD.map.setFitView(); //地图自适应
            },
            updateFooter: null,//更新实时公交数据
            updateLine: function(number, active) {
                number = number || 0;
                active = active || {
                        down: null,
                        box: null
                    };
                obj.dom.stationLines.innerHTML = '';
                obj.dom.stationLines.className = '';
                return function(data, bus, name) {
                    var result = data;
                    var that = obj.line;
                    that.busLines[bus] = result;
                    data = data.lineInfo;
                    //获取公交id
                    window.tools.ajax({
                        url: './api/getBusBase',
                        type: 'get',
                        data: {
                            name: bus
                        },
                        success: function(lineInfo) {
                            that.busLineIds[bus] = lineInfo.line_id;
                            //获取公交途经站点
                            window.tools.ajax({
                                url: './api/getBusStop',
                                type: 'get',
                                data: {
                                    name: bus,
                                    lineid: lineInfo.line_id
                                },
                                success: function(lines) {
                                    //数据校正
                                    var checkData = function(arr) {
                                        var i = 0;
                                        var direction = false;
                                        var d = {};
                                        for(var line of data) {
                                            (function() {
                                                var dom = document.createElement('li');
                                                dom.activeBus = [];

                                                var top = document.createElement('div');
                                                top.className = 'footer_busName';
                                                var busName = document.createElement('span');
                                                top.appendChild(busName);
                                                top.appendChild((function() {
                                                    var exchange = document.createElement('i');
                                                    exchange.className = 'fa fa-exchange';
                                                    return exchange;
                                                })());


                                                dom.appendChild(top);

                                                var md = document.createElement('div');
                                                md.className = 'footer_busInfo';
                                                var middle = document.createElement('small');
                                                md.appendChild(middle);

                                                var last = document.createElement('span');
                                                last.appendChild((function() {
                                                    var to = document.createElement('span');
                                                    to.className = 'to';
                                                    to.innerText = '末';
                                                    return to;
                                                })());
                                                var lastTime = document.createTextNode(line.etime.slice(0, 2) + ':' + line.etime.slice(2));
                                                last.appendChild(lastTime);
                                                md.appendChild(last);

                                                var first = document.createElement('span');
                                                first.appendChild((function() {
                                                    var from = document.createElement('span');
                                                    from.className = 'from';
                                                    from.innerText = '首';
                                                    return from;
                                                })());
                                                var firstTime = document.createTextNode(line.stime.slice(0, 2) + ':' + line.stime.slice(2));
                                                first.appendChild(firstTime);
                                                md.appendChild(first);

                                                dom.appendChild(md);

                                                var footer = document.createElement('div');
                                                var busIcon = document.createElement('i');
                                                busIcon.className = 'fa fa-bus';
                                                var span = document.createElement('span');
                                                var stops = document.createElement('span');
                                                var time = document.createElement('span');
                                                span.appendChild(document.createTextNode('还有'));
                                                span.appendChild(stops);
                                                span.appendChild(document.createTextNode('站，'));
                                                span.appendChild(time);
                                                var down = document.createElement('i');
                                                down.className = 'fa fa-angle-down';
                                                footer.appendChild(busIcon);
                                                footer.appendChild(span);
                                                footer.appendChild(down);
                                                dom.appendChild(footer);

                                                var stationsBox = document.createElement('div');
                                                stationsBox.className = 'stationsBox hiden';
                                                var stations = document.createElement('ul');
                                                stationsBox.appendChild(stations);

                                                var updateFooter = function(da) {
                                                    if(da && da.da) {
                                                        da = da.da;
                                                        span.innerHTML = '';
                                                        time.innerText = window.tools.parseMsToTime(da.cars[0].time);
                                                        stops.innerText = da.cars[0].stopdis;
                                                        span.appendChild(document.createTextNode('还有'));
                                                        span.appendChild(stops);
                                                        span.appendChild(document.createTextNode('站，'));
                                                        span.appendChild(time);

                                                        if(da.index) {
                                                            dom.index = da.index;
                                                        }
                                                        if(dom.index) {
                                                            if(dom.activeBus) {
                                                                for(var bus of dom.activeBus) {
                                                                    bus.className = '';
                                                                }
                                                            }
                                                            dom.activeBus.length = 0;
                                                            for(var car of da.cars) {
                                                                var index = dom.index - car.stopdis;
                                                                index = index < 0?0:index >= stations.childNodes.length?stations.childNodes.length - 1:index;
                                                                stations.childNodes[index].className = 'bus';
                                                                dom.activeBus.push(stations.childNodes[index]);
                                                            }
                                                        }
                                                    } else if(da) {
                                                        span.innerHTML = '';
                                                        span.appendChild(document.createTextNode(da));
                                                    } else{
                                                        span.innerHTML = '';
                                                        span.appendChild(document.createTextNode('暂无数据'));
                                                    }
                                                };

                                                var updatafooterUI = function(arr) {
                                                    stations.innerHTML = '';
                                                    var index = 0;
                                                    arr.forEach(function(s) {
                                                        var station = document.createElement('li');
                                                        var p = document.createElement('i');
                                                        s.index = index;
                                                        if(s.name == name) {
                                                            dom.index = index;
                                                            p.className = 'active';
                                                            d.activeMarker = p;
                                                            if(!window.tools.hasClass(stationsBox, 'hiden')) {
                                                                if(index == 0) {
                                                                    that.linesearchInfo.start.emit('click', {
                                                                        target: that.linesearchInfo.start
                                                                    })
                                                                } else if(index == arr.length - 1) {
                                                                    that.linesearchInfo.end.emit('click', {
                                                                        target: that.linesearchInfo.end
                                                                    })
                                                                } else {
                                                                    that.linesearchInfo.stops[index - 1].emit('click', {
                                                                        target: that.linesearchInfo.stops[index - 1]
                                                                    })
                                                                }
                                                            }
                                                        } else {
                                                            p.className = '';
                                                        }
                                                        index++;
                                                        station.appendChild(p);
                                                        station.appendChild(document.createTextNode(s.name));
                                                        stations.appendChild(station);
                                                        station.addEventListener('click', function(){
                                                            dom.index = s.index;
                                                            if(d.activeMarker) {
                                                                d.activeMarker.className = '';
                                                            }
                                                            p.className = 'active';
                                                            d.activeMarker = p;
                                                            obj.dom.handleEvent.updateFooter = updateFooter;
                                                            if(s.index == 0) {
                                                                that.linesearchInfo.start.emit('click', {
                                                                    target: that.linesearchInfo.start
                                                                })
                                                            } else if(s.index == arr.length - 1) {
                                                                that.linesearchInfo.end.emit('click', {
                                                                    target: that.linesearchInfo.end
                                                                })
                                                            } else {
                                                                that.linesearchInfo.stops[s.index - 1].emit('click', {
                                                                    target: that.linesearchInfo.stops[s.index - 1]
                                                                })
                                                            }
                                                        })
                                                    });
                                                };

                                                var switchBusLine = function() {
                                                    var lineArr = that.busLines[bus].lineInfo;
                                                    var lineNum = that.busLines[bus].lineInfo.length;
                                                    if(lineNum == 0) {
                                                    } else {
                                                        var pathArr = lineArr[d.direction].path;
                                                        var stops = lineArr[d.direction].via_stops;
                                                        var startPot = stops[0].location;
                                                        var endPot = stops[stops.length - 1].location;
                                                        that.busName = lineArr[d.direction].name;
                                                        that.busline = bus;
                                                        that.busLineId = that.busLineIds[bus];
                                                        that.dirctionReady[bus] = true;
                                                        that.drawbusLine(startPot, endPot, pathArr, stops, name);
                                                    }
                                                };

                                                top.addEventListener('click', function () {
                                                    obj.realTimeStation.infoWindow.close();
                                                    var dire = d.direction == 0 ? 1 : 0;
                                                    var l = data[dire].name.indexOf('(');
                                                    var r = data[dire].name.lastIndexOf(')');
                                                    middle.innerHTML = data[dire].name.slice(l + 1, r);
                                                    firstTime.textContent = data[dire].stime.slice(0, 2) + ':' + data[dire].stime.slice(2);
                                                    lastTime.textContent = data[dire].etime.slice(0, 2) + ':' + data[dire].etime.slice(2);
                                                    d.direction = dire;
                                                    switchBusLine();
                                                    updatafooterUI(that.busLines[bus].lineInfo[dire].via_stops);
                                                    if (d[dire]) {
                                                        window.tools.ajax({
                                                            url: './api/getArriveBase',
                                                            type: 'get',
                                                            data: {
                                                                name: bus,
                                                                lineid: lineInfo.line_id,
                                                                direction: dire,
                                                                stopid: d[dire]
                                                            },
                                                            success: function (da) {
                                                                if (da && da.cars && da.cars[0]) {
                                                                    updateFooter({da:da});
                                                                }
                                                            }
                                                        });
                                                    } else {
                                                        updateFooter("注意该线路不经过该站点哦");
                                                    }
                                                });
                                                down.addEventListener('click', function() {
                                                    if(window.tools.hasClass(down, 'fa-angle-down')) {
                                                        if(active.down) {
                                                            window.tools.removeClass(active.down, 'fa-angle-up');
                                                            window.tools.addClass(active.down, 'fa-angle-down');
                                                            window.tools.addClass(active.box, 'hiden');
                                                        }
                                                        window.tools.removeClass(down, 'fa-angle-down');
                                                        window.tools.addClass(down, 'fa-angle-up');
                                                        window.tools.removeClass(stationsBox, 'hiden');
                                                        active.down = down;
                                                        active.box = stationsBox;
                                                    } else {
                                                        window.tools.removeClass(down, 'fa-angle-up');
                                                        window.tools.addClass(down, 'fa-angle-down');
                                                        window.tools.addClass(stationsBox, 'hiden');
                                                    }
                                                    obj.dom.handleEvent.updateFooter = updateFooter;
                                                    obj.nearBy.hideBusStation(); //隐藏周边组件
                                                    footer.appendChild(stationsBox);
                                                    switchBusLine();
                                                });

                                                var stop = [];
                                                var differentSD = [];
                                                var differentSMY = [];
                                                var s, g, l, sd, smy;
                                                for (s = 0, l = line.via_stops.length; s < l; s++) {
                                                    for (g = 0; g < lines[arr[i]].stops.length; g++) {
                                                        if (line.via_stops[s].name === lines[arr[i]].stops[g].zdmc.replace('（', '(').replace('）', ')')) {
                                                            var getArriveBase = function (dire) {
                                                                direction = true;
                                                                that.busDirection[bus] = dire;
                                                                d.direction = that.busDirection[bus];

                                                                var lineName = [];
                                                                var ll = data[d.direction].name.indexOf('(');
                                                                var r = data[d.direction].name.lastIndexOf(')');
                                                                lineName[0] = data[d.direction].name.slice(0, ll);
                                                                lineName[1] = data[d.direction].name.slice(ll + 1, r);
                                                                busName.innerHTML = lineName[0];
                                                                middle.innerHTML = lineName[1];
                                                                firstTime.textContent = data[d.direction].stime.slice(0, 2) + ':' + data[d.direction].stime.slice(2);
                                                                lastTime.textContent = data[d.direction].etime.slice(0, 2) + ':' + data[d.direction].etime.slice(2);
                                                                obj.dom.stationLines.appendChild(dom);

                                                                if(name === null) {
                                                                    updateFooter("未选择站点");
                                                                } else {
                                                                    window.tools.ajax({
                                                                        url: './api/getArriveBase',
                                                                        type: 'get',
                                                                        data: {
                                                                            name: bus,
                                                                            lineid: lineInfo.line_id,
                                                                            direction: that.busDirection[bus],
                                                                            stopid: d[dire]
                                                                        },
                                                                        success: function (da) {
                                                                            if (da && da.cars && da.cars[0]) {
                                                                                updateFooter({da:da});
                                                                            } else {
                                                                                updateFooter();
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                                if (number == 2) {
                                                                    //更多
                                                                    window.tools.addClass(obj.dom.stationLines, 'more');
                                                                }
                                                                number++;
                                                                obj.dom.judgePosition();
                                                            };
                                                            var getDirection = function (sdOld, smyOld) {
                                                                sdOld = sdOld || line.via_stops[s];
                                                                smyOld = smyOld || lines[arr[i]].stops[g];
                                                                if(name === null) {
                                                                    var dire = lines[arr[i]].direction === 'false' ? 0 : 1;
                                                                    d[dire] = smyOld.id;
                                                                    if (!direction) {
                                                                        getArriveBase(dire);
                                                                    }
                                                                } else if (sdOld.name === name) {
                                                                    var dire = lines[arr[i]].direction === 'false' ? 0 : 1;
                                                                    d[dire] = smyOld.id;
                                                                    if (!direction) {
                                                                        getArriveBase(dire);
                                                                    }
                                                                }
                                                            };
                                                            getDirection();
                                                            line.via_stops[s].shiID = lines[arr[i]].stops[g].id; //线路站点id
                                                            stop.push(line.via_stops[s]);
                                                            while (lines[arr[i]].stops[g].id !== lines[arr[i]].stops[0].id) {
                                                                differentSMY.push(lines[arr[i]].stops.splice(0, 1)[0]);
                                                                g--;
                                                            }
                                                            while (differentSMY.length && differentSD.length) {
                                                                sd = differentSD.splice(0, 1);
                                                                smy = differentSMY.splice(0, 1);
                                                                sd[0].shiID = smy[0].id; //线路站点id
                                                                getDirection(sd[0], smy[0]);
                                                                stop.splice(-1, 0, sd[0]);
                                                            }
                                                            differentSMY.length = 0;
                                                            differentSD.length = 0;
                                                            lines[arr[i]].stops.splice(0, 1);
                                                            break;
                                                        }
                                                    }
                                                    if (g == lines[arr[i]].stops.length) {
                                                        differentSD.push(line.via_stops[s]);
                                                    }
                                                }
                                                while (differentSD.length && lines[arr[i]].stops.length) {
                                                    sd = differentSD.splice(0, 1);
                                                    smy = lines[arr[i]].stops.splice(0, 1);
                                                    sd[0].shiID = smy[0].id; //线路站点id
                                                    stop.push(sd[0]);
                                                    if (sd[0].name === name) {
                                                        var dire = lines[arr[i]].direction === 'false' ? 0 : 1;
                                                        d[dire] = lines[arr[i]].stops[g].id;
                                                        if (!direction) {
                                                            getArriveBase(dire);
                                                        }
                                                    }
                                                }
                                                that.busLines[bus].lineInfo[i].via_stops = stop; //保存校正后的数据
                                                updatafooterUI(stop);
                                                i++;
                                            })()
                                        }
                                    };
                                    if(!lines['lineResults1'].stops || !lines['lineResults0'].stops) {
                                        return;
                                    }
                                    that.isSingleLine[bus] = (!(lines['lineResults1'].stops.length && lines['lineResults0'].stops.length));
                                    if(!that.isSingleLine[bus] && data[0].via_stops[0].name !== lines['lineResults1'].stops[0].zdmc.replace('（', '(').replace('）', ')')
                                        && data[0].via_stops[data[0].via_stops.length - 1].name !== lines['lineResults1'].stops[lines['lineResults1'].stops.length - 1].zdmc.replace('（', '(').replace('）', ')')) {
                                        data = data.reverse();
                                    } else if(that.isSingleLine[bus]) {
                                        if(!lines['lineResults1'].stops.length && data.length > 1) {
                                            data = data.reverse();
                                        } else if(!lines['lineResults1'].stops.length && data.length == 1) {
                                            data[1] = JSON.parse(JSON.stringify(data[0]));
                                        }
                                    }
                                    checkData(['lineResults1', 'lineResults0']);
                                },
                                error: function() {
                                    console.log('稍后再试');
                                }
                            });
                        }
                    });
                }
            }
        }
    }
}(window.realTimeBus = window.realTimeBus || {});

//加载高德模块
window.realTimeBus.nearBy.searchNearByWindow = new AMap.InfoWindow({
    content: window.realTimeBus.nearBy.searchNearByContent,
    isCustom: true
});//地图选点信息窗口
AMap.service('AMap.StationSearch',function(){//回调函数
    //实例化StationSearch
    window.realTimeBus.search.stationSearch= new AMap.StationSearch({
        pageIndex: 1, //页码
        pageSize: 60, //单页显示结果条数
        city:'shanghai'    //确定搜索城市
    });
    //TODO: 使用stationSearch对象调用行政区查询的功能
});

//定位
var geoEventCom, geoEventErr;
window.realTimeBus.GD.map.plugin('AMap.Geolocation', function() {
    geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,//是否使用高精度定位
        timeout: 10000,//超过10秒后停止定位
        maximumAge: 0,//定位结果不缓存
        convert: true,//自动偏移坐标，偏移后的坐标为高德坐标
        showButton: true,//显示定位按钮
        buttonPosition: 'LB',//定位按钮停靠位置，左下角
        buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量
        showMarker: true,//定位成功后在定位到的位置显示点标记
        showCircle: false,//定位成功后用圆圈表示定位经度范围
        panToLocation: true,//定位成功后将定位到的位置作为地图中心点
        zoomToAccuracy: false,//定位成功后调整地图视野范围使定位位置及经度范围视野内可见
        //extension: 'all'
    });
    window.realTimeBus.GD.map.addControl(geolocation);
    geolocation.getCurrentPosition();
    geoEventCom = AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
    geoEventErr = AMap.event.addListener(geolocation, 'error', onError);//返回定位出错信息
});

//定位成功
function onComplete(info) {
    window.realTimeBus.nearBy.searchNearBy();
    AMap.event.removeListener(geoEventCom);
    AMap.event.removeListener(geoEventErr);

    //打印定位信息
    var str = ['定位成功'];
    str.push('经度:' + info.position.getLng());
    str.push('纬度:' + info.position.getLat());
    if(info.accuracy) {
        str.push('精度:' + info.accuracy + '米');
    }
    str.push('是否经过偏移:' + (info.isConverted?'是':'否'));
    console.log(str.join('\n'));

    window.realTimeBus.nearBy.nearStops.lnglat = info.position;

    window.realTimeBus.nearBy.getStops({
        location: info.position.getLng() + ',' + info.position.getLat(),
        radius: window.realTimeBus.user.radius,
        position: info.position
    }); //查询周边公交站点
}

//定位失败
function onError(data) {
    window.realTimeBus.GD.map.setCenter(new AMap.LngLat(121.438408, 31.280004));
    AMap.event.removeListener(geoEventCom);
    AMap.event.removeListener(geoEventErr);

    console.log('定位失败');
    window.realTimeBus.nearBy.getStops({
        location: 121.438408 + ',' + 31.280004,
        radius: window.realTimeBus.user.radius,
        position: new AMap.LngLat(121.438408, 31.280004)
    }); //查询周边公交站点
    window.realTimeBus.nearBy.searchNearBy();
}
