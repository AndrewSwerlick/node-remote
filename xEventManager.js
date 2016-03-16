var x11 = require('x11/lib'),
	spawn = require('child_process').spawn;
	log = require('sys').puts;
	keyMapper = require('./keyMapper.js');


function XManager(XDisplayClient){
	self = this;
	self.X = XDisplayClient;
	self.root = X.display.screen[0].root;
	
	var min = X.display.min_keycode;
	var max = X.display.max_keycode;
	self.X.GetKeyboardMapping(min, max-min, function(err, list){
		if(err) throw err; 
		keyMapper.createMapper(list, min, function(mapper){
			self.keyMapper = mapper;	
		});
	});
	
	X.GetGeometry(self.root, function(err, result){
		if(err) throw err;
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
	this.X.QueryPointer(this.root, function(err, res){
		if(err) throw err;
		newX = res.x + x;
		newY = res.y + y;
		this.X.WarpPointer(0,this.root,0,0,0,0,x,y);
	});
}

XManager.prototype.keyUp = function (keyCode){
	X.require('xtest', function(err, test) {
		if(err) throw err;
		test.FakeInput(test.KeyRelease, self.keyMapper.mapKey(keyCode), 0, root, 0, 0);
	});
}

XManager.prototype.keyDown = function (keyCode){
	X.require('xtest', function(err, test) {
		if(err) throw err;
		test.FakeInput(test.KeyPress, self.keyMapper.mapKey(keyCode), 0, root, 0,0);
	});
}

XManager.prototype.click = function (clickCode){
	X.require('xtest', function(err, test){
		if(err) throw err;
		test.FakeInput(test.ButtonPress, clickCode, 0, root, 0,0);
		test.FakeInput(test.ButtonRelease, clickCode, 0, root, 0,0);
	});
}

module.exports.createXManager = function(cb){
	x11.createClient(function(err, display) {
		if(err) throw err;
		X = display.client;
		XManager = new XManager(X);
		cb(XManager);
	});
}

