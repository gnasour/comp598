
var Gpio = require('onoff').Gpio;
var LED = new Gpio(4,'out');
var pushButton = new Gpio(17,'in','falling');
var count = 0;
pushButton.watch(function (err, value){
	count += 1;
	console.log(count);
});

function unexportOnClose(){

	LED.writeSync(0);
	LED.unexport();
	pushButton.unexport();

};

process.on('SIGNIT', unexportOnClose);
