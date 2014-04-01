var http = require("http");
var port = 3000;
var ip = "127.0.0.1";

var handleRequest =  require('./request-handler.js');
var server = http.createServer(handleRequest.handleRequest);
console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);