const vmi = require('./vmi');
const crypt = require('./crypto');

const test1 = () => {
	var codes_result = [];
	codes_result.push(vmi.get_state('trivial','code'))
	console.log("Retrieving Data from Dom-1");
	for(var i=1; i<7; i++)
		codes_result.push(vmi.get_state(('trivial_' + i.toString()),'code'))
	for(var i=0; i<codes_result.length; i++)
		console.log(crypt.hash(codes_result[i]['result']['data']).toString('hex'));

test1();