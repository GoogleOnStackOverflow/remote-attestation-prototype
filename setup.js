const fs = require('fs');
const crypt = require('./crypto');
const constant = require('./constants');

const main = () => {
	var keys = crypt.keygen();
	fs.writeFileSync(constant.PATH_TO_PRIVATE_KEY_FILE, keys[0]);
	fs.writeFileSync(constant.PATH_TO_PUBLIC_KEY_FILE, keys[1]);

	console.log('Key Files Generated');
};

main();