'use strict';

var express = require('express');
var http = require('http');
var express = require('express');
var parser = require('body-parser');
// var wot = require('wotjs');
var wot = require('/home/pi/etri/wot-enhanced/wot');
var async = require('async');
var _ = require('lodash');
var log4js = require('log4js');

log4js.configure(__dirname + '/log4js_config.json');

var log = log4js.getLogger('Room1');

var app = express();
var port = process.env.PORT || 8088;

app.use(parser.urlencoded());
app.use(parser.json());
app.set('port', port);

var router = express.Router();

router.use(function (req, res, next) {
    console.log('wot call---');
    next();
});

router.get('/temperatur/:id', function (req, res) {
    var result;

    wot.getSensorValue(req.params.id, function (err, data) {
        result = data;
        res.json(data);
    });
});

app.use(router);

var server = http.createServer(app);
var netProfile;

async.series([
    function (done) {
        var options = {
            websocketTopic: 'sensorData',
            reportInterval: netProfile && netProfile.reportingPeriod
        };

        wot.init(server, options, done);

        log.info('WoT.js initialize.');
    },
    function (done) {
        done();

        var dht11 = 'sensorjs:///gpio/18/dht11/dht11-18';

        wot.createSensor(dht11, function (error, data) {
            if (error) {
                log.error('DHT11 registration fail!!!');
                process.exit(1);
            } else {
                // setInterval(function () {
                //     log.debug('################################');
                //     wot.getSensorValue('dht11-18', function (err, data) {
                //         log.info('DHT11 data : ', data);
                //         log.debug('################################');
                //     });
                // }, 3000);
            }
        });
    }
], function (error) {
        if (error) {
            log.error(error);
            process.exit(1);
        }

        server.listen(app.get('port'));

        // app.listen(port);
        log.info('Server start - [%s]', app.get('port'));
        log.debug('debug');
    }
);