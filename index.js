var myApiLogger = () => {

    return (req, res, next) => {
        req._startTime = new Date();
       
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
    }
}

module.exports = myApiLogger;