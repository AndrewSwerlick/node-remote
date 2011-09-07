 var staticMap = {
	'18': 'LT',
	'8' : 'BackSpace',
	'20' : 'CAPS_LOCK',
	'188' : ',',
	//	COMMAND: 91,
	//	COMMAND_LEFT: 91, // COMMAND
	//	COMMAND_RIGHT: 93,
	'17' : 'Ctrl',
	'46' : 'Delete',
	'40' : 'Down',
	'35' : 'End',
	'13' : 'Return',
	'27' : 'Escape',
	'36' : 'Home',
	'45' : 'Insert',
	'37' : 'Left',
	//MENU: 93, // COMMAND_RIGHT
	//	NUMPAD_ADD: 107,
	//	NUMPAD_DECIMAL: 110,
	//	NUMPAD_DIVIDE: 111,
	//	NUMPAD_ENTER: 108,
	//	NUMPAD_MULTIPLY: 106,
	//	NUMPAD_SUBTRACT: 109,
	'34' : 'Page_Down',
	'33' : 'Page_up',
	'190' : 'period' ,
	'39' : 'Right',
	'16' :'Shift',
	'32' : 'space',
	'9' : 'tab',
	'38' : 'up'
	//	WINDOWS: 91
} 

module.exports.mapKey = function(keyCode){
	key = staticMap[keyCode];
	if (key== undefined)
		key = String.fromCharCode(keyCode);
	return key;
}
