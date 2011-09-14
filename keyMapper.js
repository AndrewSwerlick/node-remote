var exceptionKeys = {
'190' : '46',//PERIOD CHROME
'16' : '65506', //SHIFT CHROME
'17' : '65507', //CTRL CHROME
'18' : '65513', //ALT CHROME
'34' : '65307', //ESC CHROME
'191' : '47', //BACKSLASH CHROME
'20' : '65509', //CAPS CHROME
'9' : '65289', //TAB CHROME
'189' : '45',  //MINUS CHROME
'187' : '61', //EQUALS CHROME
'8' :  '65288', //BACKSPACE CHROME
'220' : '92', //FOWARD SLASH CHROME
'13' : '65293', //ENTER CHROME
'192' : '96', //TILDE CHROME	
'186' : '59', //SEMICOLON CHROME
'222' : '34', //QUOTES CHROME
'188' : '44', //COMMA CHROME
'27' : '65307', //ESC CHROME	
'39' : '65363', //RIGHT ARROW CHROME	
'37' : '65361', //LEFT ARROW CHROME
'38' : '65362', //UP ARROW CHROME
'40' : '65364' //DOWN ARROW CHROME
};

function buildASCIIToXKeyMap(XKeysMap,min){
	asciiToX = {};
	for(i=0; i<XKeysMap.length; i++){
		for(j=0; j< XKeysMap[i].length; j++){
   			key=XKeysMap[i][j];
			value = i + min;
			if(key!=0)	asciiToX[key] = value;
		}
	}                                         
	return asciiToX;
}

function KeyMapper(XKeysMap, min){
	self = this;
	self.keyMap = buildASCIIToXKeyMap(XKeysMap, min);	
}

KeyMapper.prototype.mapKey = function(keyCode){
	if(exceptionKeys[keyCode] != null)
		keyCode = exceptionKeys[keyCode];

	key = self.keyMap[keyCode];
	if (key == undefined || key==null)
		key = 0;
	return key;
}
	
module.exports.createMapper = function(XKeysMap, min, cb){
	cb(new KeyMapper(XKeysMap, min));
}




