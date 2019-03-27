const chalk = require('chalk');
const log = console.log;

var myApiLogger = (options) => {

    return function (req, res, next) {
        req._startTime = new Date();

        let oldW = res.write,
            oldE = res.end;

        let chunks = [];

        res.write = function (chunk) {
            chunks.push(new Buffer(chunk));
            oldW.apply(res, arguments);
        };

        res.end = function (chunk) {
            if (chunk)
                chunks.push(new Buffer(chunk));

            var body = Buffer.concat(chunks).toString('utf8');

            writeToConsole(options, { "responseBody": body }, 'green');
       
            let objToPrint = {
                executionTime: new Date() - req._startTime,
                method: req.method,
                url: req.url,
                responseStatusCode: res.statusCode,
                processId : process.pid,
                platform : process.platform,
                dateTime : new Date(),
                host : req.hostname,
                startTime : req._startTime
            };

            writeToConsole(options, objToPrint, res.statusCode < 299 ? 'cyan' : 'red');

            oldE.apply(res, arguments);

        };

        next();
    }
}

function writeToConsole(options, msg, color) {
    if (options && options.env && process.env.NODE_ENV) {
        if (options.env.indexOf(process.env.NODE_ENV) > -1) {
            writeMsg(msg, color);
        }
    }
    else {
        writeMsg(msg, color);
    }
}

function writeMsg(msg, color) {
    if (typeof (msg) === 'string')
        log(chalk[color](msg));
    else if (typeof (msg) === 'object')
        log(chalk[color](JSON.stringify(msg)));
    else if (Array.isArray(msg)) {
        for (let item of msg) {
            log(chalk[color](item));
        }
    }
}

module.exports = myApiLogger;