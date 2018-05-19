var http = require('http').createServer(handler);
var fs = require('fs');
var io = require('socket.io')(http)
var Gpio = require('onoff').Gpio;
var LED_MIDDLE = new Gpio(3, 'out');
var LED_TOP = new Gpio(2,'out');
var LED_BOTTOM = new Gpio(4, 'out');
var change_light = 0;
var switchLights;
var trafficTimeVar=0;
var blinkInterval;
var counter = 0;
http.listen(8080);

//Traffic light switching in ms
var trafficTime = 10000;

function handler(req,res){
   fs.readFile(__dirname+'/public/index.html',function(err,data){
	if(err){
		res.writeHead(404, {'Content-Type': 'text/html'});
		return res.end("404 Not FOund");
	}
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write(data);
	return res.end();
   });
}
io.sockets.on('connection', function(socket){
	socket.on('trafficTime', function(data){
		trafficTimeVar = data;
		trafficLights(trafficTimeVar);
	});

});

function trafficLights(trafficTimeData){
	clearInterval(switchLights);
	switchLights = setInterval(function(){
		if(counter % 2){
			counter = counter + 1;
			trafficLightsOne();
		}else{
			counter = counter + 1;
			trafficLightsTwo();
		}
	}, trafficTimeVar/2);
}

function blinkLED(){
	if(LED_MIDDLE.readSync() === 0){
		LED_MIDDLE.writeSync(1);
	}else{
		LED_MIDDLE.writeSync(0);
	}
	
}

function endBlink(){
	clearInterval(blinkInterval);
	setTimeout(yellowLight, trafficTimeVar/16);
	setTimeout(greenLight, trafficTimeVar/8);
}

function greenLight(){
	LED_MIDDLE.writeSync(1);
}

function yellowLight(){
	LED_MIDDLE.writeSync(0);
}

function trafficLightsOne(){
clearInterval(blinkInterval);
LED_BOTTOM.writeSync(0);
LED_TOP.writeSync(1);
blinkInterval = setInterval(blinkLED, 250);
LED_MIDDLE.writeSync(1);
setTimeout(endBlink, trafficTimeVar/4);


}

function trafficLightsTwo(){
clearInterval(blinkInterval);
LED_TOP.writeSync(0);
LED_BOTTOM.writeSync(1);
blinkInterval = setInterval(blinkLED, 250);
LED_MIDDLE.writeSync(1);
setTimeout(endBlink, trafficTimeVar/4);
}

process.on('SIGINT', function(){
	LED_MIDDLE.writeSync(0);
	LED_TOP.writeSync(0);
	LED_BOTTOM.writeSync(0);
	LED_MIDDLE.unexport();
	LED_TOP.unexport();
	LED_BOTTOM.unexport();
	process.exit();
});
