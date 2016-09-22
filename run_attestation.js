const http = require('http');
const fs = require('fs');
const crypt = require('./crypto');
const util = require('./util');
const constants = require('./constants')

const host_ip = '127.0.0.1';
const host_port = 3000;

// TODO: We should modify this to generate the expected S_prov
var get_legal_S_Prov = () => {
	return constants.DEVICE_INTERNAL_STATE;
}

// This is for testing the protocol and verifying function
var get_illegal_S_Prov = () => {
	return constants.DEVICE_SSTORE_SECRET_KEY;
}

const main = () => {
	const S_chal = util.get_random(16);
	var S_chal_to_send = util.hexadecimal_encode(S_chal);

	var options = {
		host: host_ip,
		port: host_port,
		path:`/attest/${S_chal_to_send}`
	};

	http.get(options, (res) => {
		if(res.statusCode === 400){
			console.error('Bad Request');
		}else if(res.statusCode === 200){
			var str = '';
			res.on('data', function (chunk) {
				str += chunk;
  			});

			res.on('end', function () {
				// Parse Alpha from http response
				console.log(str);
				var res_obj = JSON.parse(str);
				var alpha = res_obj['alpha'];
				console.log(`Alpha: ${alpha}`);
				alpha = util.hexadecimal_decode(alpha);

				// Generate expected alpha
				var state = crypt.hash(get_legal_S_Prov());
				console.log(`State: ${state}`);

				var expected_alpha = Buffer.concat([S_chal, state], S_chal.length + state.length)
				// Get Public key from fs
				var key_public = fs.readFileSync(constants.PATH_TO_PUBLIC_KEY_FILE);

				// Verify
				if(crypt.verify(key_public, expected_alpha, alpha)){
					console.log('Verified! The device is legal');
				}else{
					console.log('Not verified! The device is illegal');
				}
  			});
		}else{
			console.error(res.statusCode);
		}
	})
}

main();