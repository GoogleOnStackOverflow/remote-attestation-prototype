const fs = require('fs');
const crypt = require('./crypto');
const constant = require('./constants');

const main = () => {
	const keys = crypt.keygen();
	const pri_key_enc = crypt.encrypt(constant.DEVICE_SSTORE_SECRET_KEY, keys[0]);
	fs.writeFileSync(constant.PATH_TO_PRIVATE_KEY_FILE, pri_key_enc);
	fs.writeFileSync(constant.PATH_TO_PUBLIC_KEY_FILE, keys[1]);

	console.log('Key Files Generated');
};

main();