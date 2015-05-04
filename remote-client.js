var socket = io();

$(document).mousemove(
	function(e){
		socket.emit('move', {
			xPercent: (e.pageX / $(window).width()) * 100,
			yPercent: (e.pageY / $(window).height()) * 100,
		});
	}
);


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

//Adding touch events after the page is loaded
$(document).ready(function(){
	$.jQTouch({
		initializeTouch: 'body'
	});
	$('.current').bind('drag' ,function(e, info){
		socket.emit('moveRelative', {		
				x: info.deltaX/10,
	         	y: info.deltaY/10,
		});
	});
});

