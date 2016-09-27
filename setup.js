const fs = require('fs');
const sstore = require('./sstore');
const crypt = require('./crypto');
const constant = require('./constants');

const main = () => {
	console.log('Generating a key pair...');

	// generate a key pair
	const keys = crypt.keygen();
	const pri_key = keys[0];
	const pub_key = keys[1];

	// prover stores the private key
	sstore.write('_attestation_private_key_', pri_key);

	// challenger stores the public key
	fs.writeFileSync(constant.PATH_TO_PUBLIC_KEY_FILE, pub_key);

	console.log('Done');
};

main();
