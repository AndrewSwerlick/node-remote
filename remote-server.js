var	io = require('socket.io'),
	xManager = require('./xEventManager.js'),
	server = require('./simpleServer').createServer();
	

sockets = io.listen(server).sockets,

server.listen(8000);

xManager.createXManager(function(manager) {
	sockets.on('connection', function(socket) {
		
		socket.on('move', function(data) {
	        try{manager.move(data.xPercent, data.yPercent);}
	        catch(err){}
		});

		socket.on('moveRelative', function(data) {
        	try{manager.moveRelative(data.x, data.y);}
        	catch(err){}
		});

		socket.on('keyUp', function(data){
        	try{manager.keyUp(data.key);}
        	catch(err){}
		});

		socket.on('keyDown', function(data){
        	try{manager.keyDown(data.key);}
       		catch(err){}
		});

		socket.on('keyPress', function(data){
        	try{manager.keyPress(data.key);}
        	catch(err){}
		});

		socket.on('click', function(data){
        	try{manager.click(data.clickCode);}
        	catch(err){}
		});
	});

});

