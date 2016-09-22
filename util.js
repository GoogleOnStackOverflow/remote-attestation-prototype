const fs = require('fs');

const get_random = exports.get_random = function (number_of_bytes) {
	const random_buf = new Buffer(number_of_bytes);

	const fd = fs.openSync('/dev/urandom', 'r');
	fs.readSync(fd, random_buf, 0, number_of_bytes);
	fs.closeSync(fd);

	return random_buf;
};

const hexadecimal_encode = exports.hexadecimal_encode = function (raw_buffer) {
	const hex_string = raw_buffer.toString('hex');
	return hex_string;
};

const hexadecimal_decode = exports.hexadecimal_decode = function (hex_string) {
	const raw_buffer = new Buffer(hex_string, 'hex');
	return raw_buffer;
};
