var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
};

var clicks = {};

exports.handleRequest = function(request, response) {

  if(request.method === "POST") {
    request.on('data', function(data) {
      var stringData = data.toString();
      var parseData = JSON.parse(stringData);
      var id = parseData.id; 
      clicks[id] = parseData.clicks;
      results.push(parseData);
    });
  }

  if(request.method === "GET") {
    
  }

  var output = JSON.stringify(wrapperObject);
  var statusCode = 200;
  var headers = defaultCorsHeaders;

  response.writeHead(statusCode, headers);
  response.end(output);
};
