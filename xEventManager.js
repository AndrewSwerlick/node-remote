var x11 = require('node-x11/lib/x11'),
	spawn = require('child_process').spawn;
	keyMap = require('./keyMap.js').mapKey;
	log = require('sys').puts;

function XManager(XDisplayClient){
	self = this;
	self.X = XDisplayClient;
	self.root = X.display.screen[0].root;
	
	//Using winfo to get our screen resolutions height and width
	//This is a dirty hack
	wininfo = spawn('xwininfo', ['-root']);	
	wininfo.stdout.on('data', function(data){
		w = (data + "").match(/Width: ([0-9]+)\n/)[0].replace("Width: ", "");
	   	h = (data + "").match(/Height: ([0-9]+)\n/)[0].replace("Height: ", "");	
		self.width = parseFloat(w);
		self.height = parseFloat(h);
	});
}

XManager.prototype.move= function(xPercent, yPercent){
	x = Math.round(self.width *(xPercent/100));
	y = Math.round(self.height * (yPercent/100));
	this.X.WarpPointer(0,this.root,0,0,0,0,x,y);	
}

//For all of these kepress or click functions we use xdotool.
//This is a realllly dirty hack, and at somepoint this shoud change
//to use an XSocket
XManager.prototype.keyUp = function (keyCode){
	xKey = keyMap(keyCode);
	spawn('xdotool', ['keyup', xKey]);		
	//X.SendEvent(false,0,x11.eventMask.KeyPress, buildKeyEvent(data.key, root, 'press'));
}

XManager.prototype.keyDown = function (keyCode){
 	xKey = keyMap(keyCode);
	log(xKey);
	spawn('xdotool', ['keydown', xKey]);
	//X.SendEvent(false,0,x11.eventMask.KeyPress, buildKeyEvent(data.key, root, 'release'));
}

XManager.prototype.keyPress = function(keyCode){
	xKey = keyMap(keyCode);
	log(xKey);
	spawn('xdotool', ['key', xKey]);
}

XManager.prototype.click = function (clickCode){
	spawn('xdotool', ['click', clickCode]);
}

module.exports.createXManager = function(cb){
	x11.createClient(function(display) {
		X = display.client;
		XManager = new XManager(X);
		cb(XManager);
	});
}

