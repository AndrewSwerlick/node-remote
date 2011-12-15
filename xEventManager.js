var x11 = require('x11/lib/x11'),
	spawn = require('child_process').spawn;
	log = require('sys').puts;
	keyMapper = require('./keyMapper.js');


function XManager(XDisplayClient){
	self = this;
	self.X = XDisplayClient;
	self.root = X.display.screen[0].root;
	
	var min = X.display.min_keycode;
	var max = X.display.max_keycode;
	self.X.GetKeyboardMapping(min, max-min, function(list){ 
		keyMapper.createMapper(list, min, function(mapper){
			self.keyMapper = mapper;	
		});
	});
	
	X.GetGeometry(self.root, function(result){
		self.width = result.width;
		self.height = result.height;
	});
}

XManager.prototype.move= function(xPercent, yPercent){
	x = Math.round(self.width *(xPercent/100));
	y = Math.round(self.height * (yPercent/100));
	this.X.WarpPointer(0,this.root,0,0,0,0,x,y);	
}

XManager.prototype.moveRelative= function(x, y){
	this.X.QueryPointer(this.root, function(res){
		newX = res.x + x;
		newY = res.y + y;
		this.X.WarpPointer(0,this.root,0,0,0,0,x,y);
	});
}

XManager.prototype.keyUp = function (keyCode){
	X.require('xtest', function(test) {
			test.FakeInput(test.KeyRelease, self.keyMapper.mapKey(keyCode), 0, root, 0, 0);
	});
}

XManager.prototype.keyDown = function (keyCode){
	X.require('xtest', function(test) {
			test.FakeInput(test.KeyPress, self.keyMapper.mapKey(keyCode), 0, root, 0,0);
	});
}

XManager.prototype.click = function (clickCode){
	X.require('xtest', function(test){
		test.FakeInput(test.ButtonPress, clickCode, 0, root, 0,0);
		test.FakeInput(test.ButtonRelease, clickCode, 0, root, 0,0);
	});
}

module.exports.createXManager = function(cb){
	x11.createClient(function(display) {
		X = display.client;
		XManager = new XManager(X);
		cb(XManager);
	});
}

