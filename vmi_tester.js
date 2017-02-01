const vmi = require('./vmi');

const test1 = () => {
	var codes_result = [];
	codes_result.push(vmi.get_state('trivial','code'))
	for(var i=1; i<7; i++);
	codes_result.push(vmi.get_state(('trivial_' + i.toString()),'code'))
	console.log(codes_result[1]['result']);
}

test1();