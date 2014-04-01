var http = require("http");
var fs = require("fs");
var messageHandler = require('./request-handler.js');
var url = require('url');
var port = 3000;
var ip = "127.0.0.1";

var routes = {
  "/clicks": messageHandler.handleRequest
};

var router = function(request, response) {
  var path = url.parse(request.url).pathname;
  var route = routes[path];
  if(route) {
    route(request, response);
  } else {
    console.log('nonononono');
  }
};

var handleRequest =  require('./request-handler.js');
var server = http.createServer(handleRequest.handleRequest);
console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);
