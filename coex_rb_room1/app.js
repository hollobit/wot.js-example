'use strict';

var express = require('express');
var http = require('http');
var express = require('express');
var parser = require('body-parser');
var wot = require('../etri/wot-enhanced/index');
// var wot = require('wotjs');
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
        res.json(result);
    });
});

router.get('/light/:id', function (req, res) {
    var result;

    wot.getSensorValue(req.params.id, function (err, data) {
        result = data;

        res.json(result);
    });
});

router.get('/humitidy/:id', function (req, res) {
    var result;

    wot.getSensorValue(req.params.id, function (err, data) {
        result = data;

        res.json(result);
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

        var client = require('socket.io-client')('http://localhost:8088', {
            reconnection: true,
            reconnectionDelay: 500
        });

        // client.connect(port, '10.0.1.5', function () {
        //     log.debug('*********************************');
        //     log.debug('Socket connected.');
        //     log.debug('*********************************');
        // });

        client.on('sensorData', function (data) {
            log.debug(data);

            if (data.type === 'motion') {
                log.info('motion value >>> ', data.value);

                var commands = [{pin: 18, command: (data.value === 1)? 'on': 'off'}];

                wot.setActurators('gpio', 'rgbLed', commands, null);
            }
        });

        client.on('disconnect', function () {
            log.info('*********************************');
            log.info('Socket closed.');
            log.info('*********************************');
        });

        client.on('reconnecting', function () {
            log.info('Try reconnecting socket...');
        });

        client.on('reconnect', function () {
            log.info('Reconnect success!');
        });

        client.on('reconnect_error', function() {
            log.fatal('Reconnect socket failed.\nExit.');
            process.exit(1);
        });
    },
    function (done) {
        done();

        var ds18b20 = 'sensorjs:///w1/28-000005559410/ds18b20/28-000005559410';
        var bh1750fvi = 'sensorjs:///i2c/0x23/BH1750/BH1750-0x23';
        var htu21d = 'sensorjs:///i2c/0x40/HTU21D/HTU21D-0x40';
        var led = 'sensorjs:///gpio/18/rgbLed/rgbLed-18';
        var motion = 'sensorjs:///gpio/24/motionDetector/motion-24';

        wot.createSensor(ds18b20, function (error, data) {
            if (error) {
                log.error('DS18B20 registration fail!!! -> ', error);
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

        wot.createSensor(bh1750fvi, function (error, data) {
            if (error) {
                log.error('BH1750 registration fail!!! -> ', error);
                process.exit(1);
            } else {

            }
        });

        wot.createSensor(htu21d, function (error, data) {
            if (error) {
                log.error('HTU21D registration fail!! -> ', error);
                process.exit(1);
            } else {

            }
        });

        wot.createSensor(motion, function (error, data) {
            if (error) {
                log.error('Motion registration fail!!! -> ', error);
                process.exit(1);
            } else {

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