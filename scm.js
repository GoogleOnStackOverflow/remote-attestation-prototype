/*
scm.js

    process_att_challenge   Buffer -> Buffer
    input: State of Chal
    output: signed alpha
*/
const sstore = require('./sstore');
const vmi = require('./vmi');
const crypt = require('./crypto');

exports.process_att_challenge = function(S_chal){
	var S_prov = crypt.hash(vmi.get_state());
	var pre_s = Buffer.concat([S_chal, S_prov], S_chal.length + S_prov.length);
	var pri = sstore.read();

	var alpha = crypt.sign(pri, pre_s);

	return alpha;
}