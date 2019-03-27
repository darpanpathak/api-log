# api-logs

[![npm version](https://badge.fury.io/js/api-logs.svg)](https://badge.fury.io/js/api-logs)

This package helps you to log **HTTP requests** in **Express** Node.js application.


# Installation

    npm install --save api-logs

# Usage

You can intialize the instance of the api-logs and then use it as a middleware in your application. By default this module will print logs if you don't pass any parameters, but you can control the printing based on the **env** key in options parameter.

Please note that this **env** key will have array of environments(allowed) as value. These environments will be compared with **process.env.NODE_ENV** variable. 

### using api-logs without any options argument

    var app = require('express')();
    var apiLogs = require('api-logs');
    
    app.use(apiLogs());
	    app.get('/', function(req, res){
		res.send('Hello from api-logs');
	});
	
	app.listen(8080);

### using api-logs with options argument
If you want to restrict logging to perticular environments, you can pass it in the options

    var app = require('express')();
    var apiLogs = require('api-logs');
    
    let  apilogOptions  = {
	    env: ['dev', 'uat']
    };
    
    app.use(apiLogs(apilogOptions));
	    app.get('/', function(req, res){
		res.send('Hello from api-logs');
	});
	
	app.listen(8080);


# Sample output

![api-logs sample output](api-logs.PNG)