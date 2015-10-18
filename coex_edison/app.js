'use strict';

var WPx_THING_ID = 'Swot-parlor';
var IS_WPX = true;
var express = require('express');
var http = require('http');
var express = require('express');
var parser = require('body-parser');
// var wot = require('wotjs');
var wot = require('../etri/wot-enhanced/index');
var async = require('async');
var _ = require('lodash');
var log4js = require('log4js');
var fs = require('fs');

//------------------------------------------
// BLE
//------------------------------------------
var noble = require('noble');
var PERIPHERAL_ID = 'd03972c8b8f4';
var SERVICE_UUID = 'fff0';
var CHARACTERISTIC = 'fff2';
var COMMAND_ON = '0xF';
var COMMAND_OFF = '0xA';
var CHARACTERISTIC_TARGET;

log4js.configure(__dirname + '/log4js_config.json');

var log = log4js.getLogger('Room1');

var Campi = require('campi');
var c = new Campi();
var cameraOption = {
    "encoding": "jpg",
    "nopreview": true,
    "timeout": 1,
    "hflip": true,
    "vflip": true,
    "sh": 70000,
    "width": 1024,
    "height": 768,
    "metering": "average"
};

var mailer = require('nodemailer');
var mailTransport = mailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'nage.dev@gmail.com',
        pass: 'spdlwl123!@#$%'
    }
});

var mailOption = {
    from: 'nage.dev@gmail.com',
    to: 'jhson@nagesoft.com'
};

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

router.post('/camera/capture', function (req, res) {
    try {
        sendCaptureImage();

        res.json({"status": "ok"});
    } catch (e) {
        res.json({"status": "error"});
    }
});

router.post('/ble/light', function (req, res) {
    if (!CHARACTERISTIC_TARGET) {
        res.json({"status": "wait", "message": "Scanning..."});
    } else {
        var buffer = new Buffer(1);

        if (req.body.command === 'ON') {
            buffer.writeUInt8(COMMAND_ON, 0);

            CHARACTERISTIC_TARGET.write(buffer, false, function (error) {
                if (error) {
                    res.json({"status": "error"});
                } else {
                    res.json({"status": "ok"});
                }
            });
        } else if (req.body.command === 'OFF') {
            buffer.writeUInt8(COMMAND_OFF, 0);

            CHARACTERISTIC_TARGET.write(buffer, false, function (error) {
                if (error) {
                    res.json({"status": "error"});
                } else {
                    res.json({"status": "ok"});
                }
            });
        } else {
            res.json({"status": "error", "message": "Invalid command."});
        }
    }
});

// router.get('/wpx/taar', function (req, res) {
//     var result;

//     wot.getThingList(function (response) {
//         result = JSON.parse(response.body);
//         result = {"status": "ok", result: result}

//         log.debug(result);

//         res.json(result);
//     });
// });

// @deprecated
router.post('/wpx/taar', function (req, res) {
    var result;

    wot.addThing(function (response) {
        log.debug('http code : ', response.statusCode);

        switch (response.statusCode) {
            case 204:
                result = {"status": "ok"};
                break;

            case 400:
                result = {"status": "error", message: "등록 정보에 오류가 있습니다."};
                break;

            case 409:
                result = {"status": "error", message: "해당 사물은 이미 등록되었습니다."};
                break;

            case 500:
                result = {"status": "error", message: "TaaR 서비스에 오류가 발생하였습니다"};
                break;
        }

        res.json(result);
    });
});

// @deprecated
router.put('/wpx/taar', function (req, res) {
    var result;

    wot.updateThing(function (response) {
        log.debug('http code : ', response.statusCode);

        switch (response.statusCode) {
            case 204:
                result = {"status": "ok"};
                break;

            case 400:
                result = {"status": "error", message: "수정 정보에 오류가 있습니다."};
                break;

            case 404:
                result = {"status": "error", message: "해당 사물이 존재하지 않습니다."};
                break;

            case 500:
            case 503:
                result = {"status": "error", message: "TaaR 서비스에 오류가 발생하였습니다"};
                break;
        }

        res.json(result);
    });
});

// @deprecated
router.delete('/wpx/taar', function (req, res) {
    var result;

    wot.deleteThing(function (response) {
        log.debug('http code : ', response.statusCode);

        switch (response.statusCode) {
            case 204:
                result = {"status": "ok"};
                break;

            case 404:
                result = {"status": "error", message: "해당 사물이 존재하지 않습니다."};
                break;

            case 500:
            case 503:
                result = {"status": "error", message: "TaaR 서비스에 오류가 발생하였습니다"};
                break;
        }

        res.json(result);
    });
});

// @deprecated
router.post('/wpx/raat', function (req, res) {
    var result;

    res.json({"status": "ok"});

    // wot.deleteThing(function (response) {
    //     log.debug('http code : ', response.statusCode);

    //     switch (response.statusCode) {
    //         case 204:
    //             result = {"status": "ok"};
    //             break;

    //         case 404:
    //             result = {"status": "error", message: "해당 사물이 존재하지 않습니다."};
    //             break;

    //         case 500:
    //         case 503:
    //             result = {"status": "error", message: "TaaR 서비스에 오류가 발생하였습니다"};
    //             break;
    //     }

    //     res.json(result);
    // });
});

app.use(router);

var server = http.createServer(app);
var netProfile;

async.series([
    function (done) {
        done();
        noble.on('stateChange', function (state) {
            if (state === 'poweredOn') {
                noble.startScanning();
            } else {
                console.log('Power off.');
                noble.stopScanning();
            }
        });

        noble.on('scanStart', function () {
            log.info('BLE bulb scan start.'); 
        });

        noble.on('scanStop', function () {
            log.info('BLE bulb scan stop.');
        });

        noble.on('discover', function (peripheral) {
            peripheral.on('connect', function () {
                log.info('Connected to bulb.');
            });

            peripheral.on('disconnect', function () {
                log.info('Disconnected to bulb.');
            });

            if (peripheral.id === PERIPHERAL_ID) {
                peripheral.connect(function (error) {
                    if (error) {
                        log.fatal('Connect bulb error >>> ' + error);

                        peripheral.disconnect();

                        process.exit(1);
                    }

                    log.info('Bulb connected.');

                    peripheral.discoverServices([SERVICE_UUID], function (error, services) {
                        if (error) {
                            log.fatal('Discover bulb service error >>> ', error);

                            peripheral.disconnect();

                            process.exit(1);
                        }

                        var service = services[0];

                        log.info('Bulb service connected.');

                        // console.log(service);

                        service.discoverCharacteristics([CHARACTERISTIC], function (error, characteristics) {
                            if (error) {
                                log.fatal('Discover bulb characteristic error >>> ', error);

                                peripheral.disconnect();

                                process.exit(1);
                            }

                            var characteristic = characteristics[0];

                            CHARACTERISTIC_TARGET = characteristics[0];

                            log.info('Bulb characteristic connected.');
                        });
                    });
                });
            }
        });
    },
    function (done) {
        var options = {
            websocketTopic: 'sensorData',
            reportInterval: netProfile && netProfile.reportingPeriod
        };

        wot.init(WPx_THING_ID, server, options, done);

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
            log.debug('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
            log.debug(data);

            if (data.type === 'motion') {
                log.info('motion value >>> ', data.value);

                if (data.value === 1) {
                    try {
                        sendCaptureImage();
                    } catch (e) {
                        // TODO: 예외처리.
                    }
                }

                // var commands = [{pin: 18, command: (data.value === 1)? 'on': 'off'}];

                // wot.setActuators('gpio', 'rgbLed', commands, null);
            }

            // wot.updateSensorData(data.id, data.value, function (response) {
            //     var result;

            //     switch (response.statusCode) {
            //         case 204:
            //             result = {"status": "ok"};
            //             break;

            //         case 404:
            //             result = {"status": "error", message: "해당 사물이 존재하지 않습니다."};
            //             break;

            //         case 500:
            //         case 503:
            //             result = {"status": "error", message: "TaaR 서비스에 오류가 발생하였습니다"};
            //             break;
            //     }

            //     log.info('Post sensor data result : ', result);
            // });
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
        // var led = 'sensorjs:///gpio/18/rgbLed/rgbLed-18';
        var motion = 'sensorjs:///gpio/24/motionDetector/motion-24';

        // wot.createSensor(ds18b20, function (error, data) {
        //     if (error) {
        //         log.error('DS18B20 registration fail!!! -> ', error);
        //         process.exit(1);
        //     } else {
        //         // setInterval(function () {
        //         //     log.debug('################################');
        //         //     wot.getSensorValue('dht11-18', function (err, data) {
        //         //         log.info('DHT11 data : ', data);
        //         //         log.debug('################################');
        //         //     });
        //         // }, 3000);
        //     }
        // });

        wot.createSensor(bh1750fvi, function (error, data) {
            if (error) {
                log.error('BH1750 registration fail!!! -> ', error);
                process.exit(1);
            } else {

            }
        });

        // wot.createSensor(htu21d, function (error, data) {
        //     if (error) {
        //         log.error('HTU21D registration fail!! -> ', error);
        //         process.exit(1);
        //     } else {

        //     }
        // });

        // wot.createSensor(motion, function (error, data) {
        //     if (error) {
        //         log.error('Motion registration fail!!! -> ', error);
        //         process.exit(1);
        //     } else {

        //     }
        // });
    },
    function (done) {
        done();

        if (IS_WPX) {
            // WPx 연동일 경우 thing으로 등록
            // wot.addThing(function (result) {
            //     log.debug('Add WPx result >>> ', result);
            //     // res.json({"status": "ok", "result": result});
            // });
        }
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

function sendCaptureImage() {
    // var filename = 'c_' + new Date().getTime() + '.jpg';
    // var fileFullPath = './' + filename;

    // c.getImageAsFile(cameraOption, fileFullPath, function (err){
    //     if (err) {
    //         log.error('Camera error >>> ', err);

    //         throw new Error('camera capture fail.');
    //     }

    //     mailOption.subject = 'Capture image';
    //     mailOption.attachments = [
    //         {
    //             fileName: filename,
    //             content: fs.createReadStream(fileFullPath),
    //             contentType: 'image/jpeg'
    //         }
    //     ];

    //     mailTransport.sendMail(mailOption, function (err, response) {
    //         if (err) {
    //             log.error('메일발송 실패 >>> ', err);

    //             throw new Error('mail send fail.');
    //         }

    //         mailTransport.close();
    //     });
    // });
}