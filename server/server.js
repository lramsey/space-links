var express = require('express');
var handle = require('./request-handler.js');

var port = 3000;
//ip address 127.0.0.1
var app = express();

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

app.configure(function(){
  app.use('/', express.static(__dirname + '/../client'));
  app.use(function(req, res, next) {
    _(defaultCorsHeaders).each(function(item, k){
        res.setHeader(k, item);
    });
    return next();
  });
});

var server = app.listen(port, function() {
    console.log('Listening on port' + server.address().port);
});

app.get('/clicks', function(req, res){
  handle.handleRequest(req, res);
});

app.post('/clicks', function(req, res){
  handle.handleRequest(req, res);
});