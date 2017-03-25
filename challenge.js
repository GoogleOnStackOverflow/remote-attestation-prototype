const request = require('request');
const fs = require('fs');
const crypt = require('./crypto');
const util = require('./util');
const constants = require('./constants')

const host_ip = '192.168.56.2';
const host_port = 3000;


const measure_request = (vm_name, proc_name, measure, nonce) => {
	var options = {
  		uri: `http://${host_ip}:${host_port}/measure/`,
  		method: 'POST',
  		json: {
  			"vm":vm_name,
  			"proc": proc_name,
  			"measure": measure,
  			"nonce": util.hexadecimal_encode(nonce)
  		}
	};

	request(options, function (error, response, body) {
  		if(!body.error){
  			var alpha = util.hexadecimal_decode(body.sign);
  			var key_public = fs.readFileSync(constants.PATH_TO_PUBLIC_KEY_FILE);
  			var expected_alpha = Buffer.from(nonce);
  			for(var i=0; i<body.result.length; i++){
  				expected_alpha = Buffer.concat([expected_alpha,util.hexadecimal_decode(body.result[i])],expected_alpha.length + util.hexadecimal_decode(body.result[i]).length)
  			}

  			if(crypt.verify(key_public, expected_alpha, alpha)){
          console.log('Sign Verified');
          console.log(body.result);
        }else
  				console.log('Sign not legal');
  			
  		}else{
  			console.log(body.error);
  		}
	});
}

const main = () => {
	const S_chal = util.get_random(16);
	measure_request('ubud1', 'trivial', 'code', S_chal)
}

main();