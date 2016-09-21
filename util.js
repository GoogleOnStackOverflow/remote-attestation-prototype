exports.hexadecimal_encode = (buf) => {
	return buf.toString('hex');
};

exports.hexadecimal_decode = (str) => {
	return new Buffer(str, 'hex');
};