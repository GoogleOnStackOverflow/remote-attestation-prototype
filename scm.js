const sstore = require('./sstore');
const vmi = require('./vmi');
const crypt = require('./crypto');
const util = require('./util');

var hex_string_to_hash = (str) => {
	var buf_to_hash = new Buffer(str,'hex');
	return crypt.hash(buf_to_hash);
}

exports.process_att_challenge = (req) => {
	var S_prov = vmi.get_state(req.vm, req.proc, req.measure);
	if(S_prov.error)
		return S_prov;

	S_prov = S_prov.result;
	S_prov_h = [];
	S_prov.forEach((str)=>{
		S_prov_h.push(hex_string_to_hash(str));
	})

	var req_nonce = util.hexadecimal_decode(req.nonce);
	var pre_s = Buffer.from(req_nonce);
	for(var i=0; i<S_prov_h.length; i++){
		pre_s = Buffer.concat([pre_s, S_prov_h[i]], pre_s.length + S_prov_h[i].length);
	}
	
	var pri = sstore.read('_attestation_private_key_');
	var alpha = crypt.sign(pri, pre_s);

	var S_prov_h_string = [];
	S_prov_h.forEach((buf)=>{
		S_prov_h_string.push(buf.toString('hex'));
	});
	return {"error":null, "result":S_prov_h_string, "sign":alpha};
}

exports.list_vm = () => {
	var vm_list = vmi.get_vm_names();
	vm_list = vm_list.toString();
	console.log(vm_list);
	var vm_list_mesg_arr = vm_list.split('\n');
	vm_list = [];
	vm_list_mesg_arr.forEach((mesg)=>{
		var name = mesg.split(' ')[0]
		if(name !== 'Name' && name != '' && name !== 'Domain-0')
			vm_list.push(name);
	});

	return vm_list;
}

exports.list_proc = (vm_name) => {
	var result = vmi.get_proc_list(vm_name);
	return result;
}