'use strict';

var WPx_THING_ID = 'Swot-enterence';
var IS_WPX = true;
var http = require('http');
var express = require('express');
var parser = require('body-parser');
// var wot = require('wotjs');
var wot = require('../etri/wot-enhanced/index');
var async = require('async');
var _ = require('lodash');
var log4js = require('log4js');
var fs = require('fs');
var request = require('request');
var ip = require('ip');
var fs = require('fs');
var cors = require('cors');

log4js.configure(__dirname + '/log4js_config.json');

var log = log4js.getLogger('Enterence');

var Campi = require('campi');
var c = new Campi();
var cameraOption = {
    "encoding": "jpg",
    "nopreview": true,
    "timeout": 1,
    "hflip": false,
    "vflip": false,
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
app.use(express.static('img'));
app.use(cors());

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

router.post('/camera', function (req, res) {
    try {
        captureImage(function (filename, fileFullPath) {
            console.log('filename >>> ', filename);
            console.log('fileFullPath >>> ', fileFullPath);
            res.json({"status": "ok", "url": "http://192.168.99.10:8088/" + filename, "fileName": filename});
        });
    } catch (e) {
        res.json({"status": "error"});
    }
});

router.post('/camera/sendCapture', function (req, res) {
    try {
        if (!req.body.receiver) {
            res.json({"status": "error", "message": "Receiver email is empty."});
        } else {
            log.debug('receiver >>> ', req.body.receiver);
            captureImage(function (filename, fileFullPath) {
                sendCaptureImage(req.body.receiver, filename, fileFullPath);
            });
        }

        res.json({"status": "ok"});
    } catch (e) {
        res.json({"status": "error"});
    }
});

router.post('/sendExistImage', function (req, res) {
    mailOption.subject = 'Capture image';
    mailOption.to = req.body.email;
    mailOption.attachments = [
        {
            fileName: req.body.fileName,
            content: fs.createReadStream('./img/' + req.body.fileName),
            contentType: 'image/jpeg'
        }
    ];

    mailTransport.sendMail(mailOption, function (err, response) {
        if (err) {
            log.error('메일발송 실패 >>> ', err);

            res.json({"status": "error"});
        } else {
            res.json({"status": "ok"});
        }

        mailTransport.close();
    });
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
            var requestOption = {
                url: 'http://192.168.99.9:8088/node/sensorData',
                method: 'post'
            };

            var sendData = {"ip": ip.address(), "id": WPx_THING_ID, "data": data};

            requestOption.json = sendData;

            request(requestOption, function (error, response, body) {
                if (error || response.statusCode != 200) {
                    log.error('Send data to Edison(192.168.99.9) fail!');
                }
            });
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
        });
    },
    function (done) {
        done();

        var ds18b20 = 'sensorjs:///w1/28-00000432d4c6/ds18b20/28-00000432d4c6';
        var bh1750fvi = 'sensorjs:///i2c/0x23/BH1750/BH1750-0x23';
        var htu21d = 'sensorjs:///i2c/0x40/HTU21D/HTU21D-0x40';
        // var led = 'sensorjs:///gpio/18/rgbLed/rgbLed-18';
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
    },
    function (done) {
        done();
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

        //addThing();
    }
);

function sendCaptureImage(receiver, filename, fileFullPath) {
    mailOption.subject = 'Capture image';
    mailOption.to = receiver;
    mailOption.attachments = [
        {
            fileName: filename,
            content: fs.createReadStream(fileFullPath),
            contentType: 'image/jpeg'
        }
    ];

    mailTransport.sendMail(mailOption, function (err, response) {
        if (err) {
            log.error('메일발송 실패 >>> ', err);

            throw new Error('mail send fail.');
        }

        mailTransport.close();
    });
}

function captureImage(callback) {
    var filename = 'c_' + new Date().getTime() + '.jpg';
    var fileFullPath = './img/' + filename;

    c.getImageAsFile(cameraOption, fileFullPath, function (err){
        if (err) {
            log.error('Camera error >>> ', err);

            throw new Error('camera capture fail.');
        }

        if (callback) {
            callback(filename, fileFullPath);
        }
    });
}

function addThing() {
    try {
        // thing 등록 요청
        var cameraData = {
            "id": "Camera",
            "type": "Actuator",
            "category": "Camera",
            "attributes": [
                {
                    "name": "email",
                    "description": "receiver email address",
                    "type": "string"
                }
            ],
            "operations": [
                {
                    "type": "setState",
                    "method": "POST",
                    "uri": wot.makeWPxOperationUri('camera'),
                    "in": [
                        "email"
                    ]
                }
            ]
        };

        wot.addThing('Raspberry', 'Raspberry_Pi_2_B', 'Enterence', new Array(cameraData), function (response) {
            if (response.statusCode === 204) {
                // edison에 전송
                console.log(wot.getThing(WPx_THING_ID));

                var thingData = {"ip": ip.address(), "id": WPx_THING_ID, "data": wot.getThing(WPx_THING_ID)};

                var requestOption = {
                    url: 'http://192.168.99.9:8088/node',
                    method: 'post'
                };

                requestOption.json = thingData;

                request(requestOption, function (error, response, body) {
                    if (error || response.statusCode != 200) {
                        log.error('Send fail------------', error);
                    } else {
                        log.info('Send added thing to gateway success.');
                    }
                });
            } else if (response.statusCode === 409) {
                log.error('^^^^^^^^^^^^^^^^^^^^^^^');
                log.error('기존 사물 등록되어 있음.');
                // 기존 등록 삭제 처리
                wot.deleteThing(function (response) {
                    log.debug('삭제처리 결과 >>> ', response.statusCode);
                    if (response.statusCode === 204) {
                        addThing();
                    }
                });
            }
        });
    } catch (e) {

    }
}
