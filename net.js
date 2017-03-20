const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const scm = require('./scm');
const util = require('./util');

var isHex = (h) => {
	if(typeof(h) !== 'string'){
		return false;
	}
	
	var re = /[0-9A-Fa-f]{32}/g;
	return (re.test(h));
};

// Legacy API
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
});
// Legacy API end

app.post('/list-vms', (req, res) => {
	var vm_list = scm.list_vm();
	res.send(vm_list);
});

app.post('/list-proc', (req, res) => {
	console.log(req.body.vm);
	var proc_list = scm.list_proc(req.body.vm);
	res.send(proc_list);
});

app.post('/measure', (req, res) => {
	console.log(req.body);

	if (!isHex(req.body.nonce)){
		console.log('400 Bad Request Sent');
		res.send(400);
	}else{
		var result = scm.process_att_challenge(req.body);
		res.send(result);
	}
});

app.post('*', (req, res) => {
	res.send(400);
});

exports.start_http_server = () => {
	var expressPort = (process.env.PORT || 3000);
	app.listen(expressPort, function () {
		console.log(`Device listening on http://localhost:${expressPort}`);
	});
};