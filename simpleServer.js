var url = require('url'),
	http = require('http'),
	path = require('path'),
	fs = require('fs');

module.exports.createServer = function()
{
	server = http.createServer(function(request, response) {
		var uri = url.parse(request.url).pathname;
		if(uri == "/"){
			uri = "/remote.html";
		}
		
		var filename = path.join(process.cwd(), uri);
		console.log(filename);

		fs.exists(filename, function(exists) {
			if(!exists) {
				response.writeHead(404, {"Content-Type": "text/plain"});
	    		response.write("404 Not Found\n");
	    		response.end();
	    		return;
			}
	
			fs.readFile(filename, "binary", function(err, file){
				response.writeHead(200);
				response.write(file, "binary");
				response.end();
				return;
			});
		});
	});
	return server;
}
