var socket = io.connect("http://10.17.63.101:8000");

$(document).mousemove(
	function(e){
		socket.emit('move', {
			xPercent: (e.pageX / $(window).width()) * 100,
			yPercent: (e.pageY / $(window).height()) * 100,
		});
	}
);

//$(document).keypress(function(e){
//	socket.emit('keyPress', {key: e.which});
//	e.preventDefault();
//	return false;
//});

$(document).keydown(
	function(e){
		socket.emit('keyDown', {
			key: e.which
		});
		$(document).keypress();
		return false;
	}
);

$(document).keyup(
	function(e){
		socket.emit('keyUp', {
			key: e.which
		});
		return false;
	}
);

$(document).click(
	function(e){
		socket.emit('click', {
			clickCode: e.which
		});
		return false;
	}
	);
