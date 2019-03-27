const chalk = require('chalk');
const log = console.log;

var myApiLogger = () => {

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
            log(chalk.green(req.path, body));
            log(chalk.blue(`API call took ${new Date() - req._startTime} ms`, req.method, req.url, res.statusCode));

            oldE.apply(res, arguments);

        };

        next();
    }
}

module.exports = myApiLogger;