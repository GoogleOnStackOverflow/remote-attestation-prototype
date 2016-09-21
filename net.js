/*
net.js

    start_http_server       () -> ()
*/
const express = require('express');
const app = express();

const scm = require('./scm');
const util = require('./util');

var isHex = (h) => {
	var re = /[0-9A-Fa-f]{6}/g;
	return (re.test(h));
}

app.get('/attest/*', (req, res) => {
	var S_chal = req.params['0'];
	if (!isHex(S_chal)){
		res.send(400);
	}else{
		var alpha = util.hexadecimal_encode( scm.process_att_challenge(util.hexadecimal_decode(S_chal)) );
		res.send(alpha);
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