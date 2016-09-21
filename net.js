/*
net.js

    start_http_server       () -> ()
*/
const express = require('express');
const app = express();

const scm = require('./scm');
const util = require('./util');

var isHex = (h) => {
	if(typeof(h) !== 'string'){
		return false;
	}
	
	var re = /[0-9A-Fa-f]{32}/g;
	return (re.test(h));
}

app.get('/attest/*', (req, res) => {
	console.log('Get Request');
	var S_chal = req.params['0'];
	if (!isHex(S_chal)){
		console.log('400 Bad Request Sent');
		res.send(400);
	}else{
		var alpha = util.hexadecimal_encode( scm.process_att_challenge(util.hexadecimal_decode(S_chal)) );
		console.log('200 OK');
		res.status(200);
		res.send({alpha: alpha});
	}
});

app.get('*', (req, res) => {
	res.send(400);
})

exports.start_http_server = () => {
	var expressPort = (process.env.PORT || 3000);
	app.listen(expressPort, function () {
		console.log(`Device listening on http://localhost:${expressPort}`);
	});
};