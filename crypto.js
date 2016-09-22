const child_process = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const _util = require('./util');
const TMPDIR = os.tmpdir();

const hash = exports.hash = function (message_buf) {
	fs.writeFileSync(path.join(TMPDIR, 'msg'), message_buf);

	child_process.spawnSync('openssl', [
		'dgst',
		'-sha256',
		'-binary',
		'-out', path.join(TMPDIR, 'digest'),
		path.join(TMPDIR, 'msg'),
	]);

	const digest_buf = fs.readFileSync(path.join(TMPDIR, 'digest'));
	return digest_buf;
};

const keygen = exports.keygen = function () {
	child_process.spawnSync('openssl', [
		'ecparam',
		'-genkey',
		'-name', 'prime256v1',
		'-outform', 'DER',
		'-out', path.join(TMPDIR, 'sk.orig'),
	]);

	child_process.spawnSync('dd', [
		'skip=10',
		'bs=1',
		'if=' + path.join(TMPDIR, 'sk.orig'),
		'of=' + path.join(TMPDIR, 'sk'),
	]);

	child_process.spawnSync('openssl', [
		'ec',
		'-pubout',
		'-inform', 'DER',
		'-outform', 'DER',
		'-in', path.join(TMPDIR, 'sk'),
		'-out', path.join(TMPDIR, 'pk'),
	]);

	const private_key_buf = fs.readFileSync(path.join(TMPDIR, 'sk'));
	const public_key_buf = fs.readFileSync(path.join(TMPDIR, 'pk'));
	return [private_key_buf, public_key_buf];
};

const sign = exports.sign = function (private_key_buf, message_buf) {
	fs.writeFileSync(path.join(TMPDIR, 'sk'), private_key_buf);
	fs.writeFileSync(path.join(TMPDIR, 'msg'), message_buf);

	child_process.spawnSync('openssl', [
		'dgst',
		'-ecdsa-with-SHA1',
		'-keyform', 'DER',
		'-sign', path.join(TMPDIR, 'sk'),
		'-out', path.join(TMPDIR, 'sig'),
		path.join(TMPDIR, 'msg'),
	]);

	const signature_buf = fs.readFileSync(path.join(TMPDIR, 'sig'));
	return signature_buf;
};

const verify = exports.verify = function (public_key_buf, message_buf, signature_buf) {
	fs.writeFileSync(path.join(TMPDIR, 'pk'), public_key_buf);
	fs.writeFileSync(path.join(TMPDIR, 'msg'), message_buf);
	fs.writeFileSync(path.join(TMPDIR, 'sig'), signature_buf);

	const child_process_result = child_process.spawnSync('openssl', [
		'dgst',
		'-ecdsa-with-SHA1',
		'-keyform', 'DER',
		'-verify', path.join(TMPDIR, 'pk'),
		'-signature', path.join(TMPDIR, 'sig'),
		path.join(TMPDIR, 'msg'),
	]);

	const exit_status_code = child_process_result.status;
	return exit_status_code === 0;
};

const encrypt = exports.encrypt = function (secretkey_buf, plaintext_buf) {
	const iv_buf = _util.get_random(16);
	const iv_hex = _util.hexadecimal_encode(iv_buf);
	const sk_hex = _util.hexadecimal_encode(secretkey_buf);

	fs.writeFileSync(path.join(TMPDIR, 'msg'), plaintext_buf);

	child_process.spawnSync('openssl', [
		'enc',
		'-e',
		'-aes-128-cbc',
		'-in', path.join(TMPDIR, 'msg'),
		'-out', path.join(TMPDIR, 'blob'),
		'-K', sk_hex,
		'-iv', iv_hex,
	]);

	const ciphertext_buf = Buffer.concat([iv_buf, fs.readFileSync(path.join(TMPDIR, 'blob'))]);
	return ciphertext_buf;
};

const decrypt = exports.decrypt = function (secretkey_buf, ciphertext_buf) {
	const iv_buf = ciphertext_buf.slice(0, 16);
	const iv_hex = _util.hexadecimal_encode(iv_buf);
	const sk_hex = _util.hexadecimal_encode(secretkey_buf);

	fs.writeFileSync(path.join(TMPDIR, 'blob'), ciphertext_buf.slice(16));

	child_process.spawnSync('openssl', [
		'enc',
		'-d',
		'-aes-128-cbc',
		'-in', path.join(TMPDIR, 'blob'),
		'-out', path.join(TMPDIR, 'msg'),
		'-K', sk_hex,
		'-iv', iv_hex,
	]);

	const plaintext_buf = fs.readFileSync(path.join(TMPDIR, 'msg'));
	return plaintext_buf;
};
