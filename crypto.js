exports.encrypt = (key, data) => {
	return data;
}

exports.decrypt = (key, data) => {
	return data;
}

exports.hash = (data) => {
	return data;
}

exports.sign = (a, b) => {
	console.log('sign!');
	console.log(a);
	console.log(b);
	return Buffer.concat([a, b], a.length + b.length);
}