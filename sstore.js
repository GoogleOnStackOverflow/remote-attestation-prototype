/*
sstore.js

    write                   Buffer -> Boolean
    read                    () -> Buffer  (maybe exception)

    read/write the key for AES-128
*/
const constant = require('./constants');
const crypt = require('./crypto');
const fs = require('fs');

const DEVICE_SSTORE_SECRET_KEY = constant.DEVICE_SSTORE_SECRET_KEY;
const PATH_TO_PRIVATE_KEY_FILE = constant.PATH_TO_PRIVATE_KEY_FILE;

// This function should not be called in the prototype because we've hard coded the DEVICE_SSTORE_SECRET_KEY
exports.write = (buf) => {
	var key = crypt.encrypt(DEVICE_SSTORE_SECRET_KEY, buf);
	fs.writeFile(PATH_TO_PRIVATE_KEY_FILE, key, (err) => {
		if(err){
			console.error(err);
			return false;
		}
	});

	return true;
};

exports.read = () => {
	fs.readFile(PATH_TO_PRIVATE_KEY_FILE, (err, data) => {
		if(err){
			throw err;
		}

		return crypt.decrypt(DEVICE_SSTORE_SECRET_KEY, data);
	});
};

