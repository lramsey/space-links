var express = require('express');
var handle = require('./request-handler.js');

var port = 3000;
//ip address 127.0.0.1
var app = express();

app.configure(function(){
  app.use('/', express.static(__dirname + '/../client'));
  app.use(express.bodyParser());
});

var server = app.listen(port, function() {
    console.log('Listening on port' + server.address().port);
});


app.post('/clicks', function(req, res){
  handle.handleRequest(req, res);
});

app.post('/newClick', function(req, res){
  handle.handleRequest(req, res);
});
