const chalk = require('chalk');
var log;
const findRemoveSync = require('find-remove');

var customApiLogger = (options) => {

    let newOpt = _validateOptions(options);

    const opts = {
        logDirectory: newOpt.logdir, // NOTE: folder must exist and be writable...
        fileNamePattern: 'api-logs-<DATE>.log',
        dateFormat: 'YYYY.MM.DD-HH'
    };
    log = require('simple-node-logger').createRollingFileLogger(opts);

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


            if (newOpt.responseBody) {
                var body = Buffer.concat(chunks).toString('utf8');
                writeMsg(options, { "responseBody": body }, 'green');
            }

            let objToPrint = {
                executionTime: new Date() - req._startTime,
                method: req.method,
                url: req.url,
                responseStatusCode: res.statusCode,
                processId: process.pid,
                platform: process.platform,
                dateTime: new Date(),
                host: req.hostname,
                requestStartTime: req._startTime
            };

            let result = findRemoveSync(newOpt.logdir, { age: { seconds:  newOpt.maxFiles }, extensions: '.log', limit: 10 });
            writeMsg(options, objToPrint, res.statusCode < 399 ? 'cyan' : 'red', _getLevel(objToPrint, newOpt.maxExecTime));

            oldE.apply(res, arguments);

        };

        next();
    }
}

function _shouldWriteToConsole(options) {
    if (options && options.env && process.env.NODE_ENV) {
        if (options.env.indexOf(process.env.NODE_ENV) > -1) {
            return true;
        }

        return false;
    }

    return true;
}

function writeMsg(options, msg, color, level = 'info') {
    if (typeof (msg) === 'string') {
        //check if consumer wants to write a console log
        if (_shouldWriteToConsole(options))
            console.log(chalk[color](msg));

        //write string type logs in a file
        log[level](msg);

    }
    else {
        if (_shouldWriteToConsole(options))
            console.log(chalk[color](JSON.stringify(msg)));

        log[level](JSON.stringify(msg));
    }
}

function _getLevel(msg, thresholdTime) {
    if (msg.responseStatusCode > 399)
        return "error";
    else if (msg.executionTime > thresholdTime)
        return "warn";
    else
        return "info";
}

function _validateOptions(options) {
    if (!options.logdir)
        options.logdir = '.';
    if (!options.maxExecTime)
        options.maxExecTime = 60000;
    if (!options.responseBody)
        options.responseBody = false;
    if (!options.maxFiles)
        options.maxFiles = 86400 * 7;
    else {
        if (!isNaN(options.maxFiles))
            options.maxFiles = parseInt(86400 * parseFloat(options.maxFiles));
        else
            options.maxFiles = 86400 * 7;
    }

    return options;
}

module.exports = customApiLogger;