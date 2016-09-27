const assert = require('assert');
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const constant = require('./constants');
const crypt = require('./crypto');

const DEVICE_SSTORE_SECRET_KEY = constant.DEVICE_SSTORE_SECRET_KEY;
const PATH_TO_SSTORE_DIRECTORY = constant.PATH_TO_SSTORE_DIRECTORY;

const ensure_sstore_directory = function () {
	const process_info = child_process.spawnSync('mkdir', [
		'-p',
		PATH_TO_SSTORE_DIRECTORY,
	]);
	assert(process_info.status === 0);
};

const idx2path = (idx) => {
	const dname = PATH_TO_SSTORE_DIRECTORY;
	const fname = Buffer(idx).toString('hex');
	return path.join(dname, fname);
};

const encrypt = (data) => {
	return crypt.encrypt(DEVICE_SSTORE_SECRET_KEY, data);
};

const decrypt = (blob) => {
	return crypt.decrypt(DEVICE_SSTORE_SECRET_KEY, blob);
};

exports.write = (idx, data) => {
	assert(typeof idx === 'string');
	assert(Buffer(idx).length <= 64);
	assert(Buffer.isBuffer(data));

	ensure_sstore_directory();

	fs.writeFileSync(idx2path(idx), encrypt(data));
	return true;
};

exports.read = (idx) => {
	assert(typeof idx === 'string');
	assert(Buffer(idx).length <= 64);

	ensure_sstore_directory();

	return decrypt(fs.readFileSync(idx2path(idx)));
};
