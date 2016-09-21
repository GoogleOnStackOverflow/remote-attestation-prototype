/*
net.js

    start_http_server       () -> ()
*/
var express = require('express');
var app = express();

const scm = require('./scm');
const util = require('./util');

var isHex = (h) => {
	var a = parseInt(h,16);
	return (a.toString(16) === h.toLowerCase());
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
	app.listen(3000);
};