var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};


var serverStorage;

exports.handleRequest = function(request, response) {
  var output;
  if(request.method === "POST") {
    serverStorage = serverStorage || request.body;
    if(request.path === '/clicks'){
      for(var key in request.body) {
        if(!serverStorage[key]['clicks']){
          serverStorage[key]['clicks'] = 0;
        }
      }
      output = JSON.stringify(serverStorage);
    }

    else if (request.path === '/newClick'){
      var returnedPost;
      for(var property in request.body){
        serverStorage[property]['clicks'] = request.body[property]['clicks'];
        returnedPost = { property: serverStorage[property] };
      }
      output = JSON.stringify(returnedPost);
    }
  }

  var statusCode = 200;
  var headers = defaultCorsHeaders;

  response.writeHead(statusCode, headers);
  response.end(output);
};
