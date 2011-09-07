var	io = require('socket.io'),
	xManager = require('./xEventManager.js'),
	server = require('./simpleServer').createServer();
	

sockets = io.listen(server).sockets,

server.listen(8000);

xManager.createXManager(function(manager) {
	sockets.on('connection', function(socket) {
		socket.on('move', function(data) {
			manager.move(data.xPercent, data.yPercent);
		});	
		socket.on('keyUp', function(data){
			manager.keyUp(data.key);
		});
		socket.on('keyDown', function(data){
			manager.keyDown(data.key);
		});
		socket.on('keyPress', function(data){
			manager.keyPress(data.key);
		});
		socket.on('click', function(data){
			manager.click(data.clickCode);
		});
	});

});

