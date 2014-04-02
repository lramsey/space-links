var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};


var serverStorage;

exports.handleRequest = function(request, response) {
  if(request.method === "POST") {
    serverStorage = serverStorage || request.body;
    for(var item in serverStorage){
      for(var key in request.body) {
        if(!request.body[key]['clicks']){
          request.body[key]['clicks'] = 0;
        }
        if(serverStorage[item]['clicks'] < request.body[key]['clicks'] && item===key ){
          serverStorage[item]['clicks'] = request.body[key]['clicks'];
        }
      }
    }
  }

  var output = JSON.stringify(serverStorage);
  var statusCode = 200;
  var headers = defaultCorsHeaders;

  response.writeHead(statusCode, headers);
  response.end(output);
};
