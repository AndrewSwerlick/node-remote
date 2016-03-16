var x11 = require('x11/lib');

x11.createClient(function(err, display) {
	if(err) throw err;
    var X = display.client;
    var min = display.min_keycode;
    var max = display.max_keycode;
    X.GetKeyboardMapping(min, max-min, function(err, list) {
    	if(err) throw err;
		asciiToX = {};
		for(i=0; i<list.length; i++){
			for(j=0; j< list[i].length; j++){
	   			key=list[i][j];
				value = i;
				if(key!=0)	asciiToX[key] = value;
			}
		}

		console.log(asciiToX);
	});
});