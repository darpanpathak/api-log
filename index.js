var myApiLogger = () => {

    return (req, res, next) => {
        req._startTime = new Date();
        //let end = res.end;

        let oldW = res.write,
            oldE = res.end;

        let chunks = [];

        res.write = (chunk) => {
            chunks.push(new Buffer(chunk));
            oldW.apply(res, arguments);
        };

        res.end = (chunk) => {
            if (chunk)
                chunks.push(new Buffer(chunk));

            var body = Buffer.concat(chunks).toString('utf8');
            console.log(req.path, body);
            console.log(`API call took ${new Date() - req._startTime} ms`, req.method, req.url, res.statusCode);

            oldE.apply(res, arguments);
        };

        next();

        // res.end = function (chunk, encoding) {
        //     var timeTaken = (new Date()) - req.startTime;

        //     logger.info("%s %s %s %s", new Date().toLocaleString(), req.method, req.url, res.statusCode);

        //     res.end = end;
        //     res.end(chunk, encoding);
        // };

        // next();
    }
}

module.exports = myApiLogger;