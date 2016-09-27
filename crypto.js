module.exports = (function(){

  const child_process = require('child_process');
  const crypto = require('crypto');
  const fs = require('fs');
  const os = require('os');
  const path = require('path');

  const hash = function (message_buf) {
    return crypto.createHash('sha256').update(message_buf).digest();
  };

  const keygen = function () {
    var TMPDIR = os.tmpdir();

    child_process.spawnSync('openssl', [
      'ecparam',
      '-genkey',
      '-name', 'secp256k1',
      '-outform', 'PEM',
      '-out', path.join(TMPDIR, 'sk.orig'),
    ]);

    child_process.spawnSync('dd', [
      'skip=71',
      'bs=1',
      'if=' + path.join(TMPDIR, 'sk.orig'),
      'of=' + path.join(TMPDIR, 'sk'),
    ]);

    child_process.spawnSync('openssl', [
      'ec',
      '-pubout',
      '-inform', 'PEM',
      '-outform', 'PEM',
      '-in', path.join(TMPDIR, 'sk'),
      '-out', path.join(TMPDIR, 'pk'),
    ]);

    var private_key_buf = fs.readFileSync(path.join(TMPDIR, 'sk'));
    var public_key_buf = fs.readFileSync(path.join(TMPDIR, 'pk'));

    fs.unlinkSync(path.join(TMPDIR, 'sk.orig'));
    fs.unlinkSync(path.join(TMPDIR, 'sk'));
    fs.unlinkSync(path.join(TMPDIR, 'pk'));

    return [private_key_buf, public_key_buf];
  };

  const sign = function (private_key_buf, message_buf) {
    var signobj = crypto.createSign('sha256');
    signobj.update(message_buf);
    return signobj.sign(private_key_buf.toString());
  };

  const verify = function (public_key_buf, message_buf, signature_buf) {
    var verifyobj = crypto.createVerify('sha256');
    verifyobj.update(message_buf);
    return verifyobj.verify(public_key_buf.toString(), signature_buf);
  };

  const encrypt = function (secretkey, plaintext_buf) {
    if (!Buffer.isBuffer(secretkey) || !Buffer.isBuffer(plaintext_buf)) throw TypeError();
    if (secretkey.length !== 16) throw RangeError();

    var iv = crypto.randomBytes(16);
    var cipher = crypto.createCipheriv('aes-128-gcm', secretkey, iv);
    var buf_list = [];

    buf_list.push(iv);
    buf_list.push(cipher.update(plaintext_buf));
    buf_list.push(cipher.final());
    buf_list.unshift(cipher.getAuthTag());

    return Buffer.concat(buf_list);
  };

  const decrypt = function (secretkey, ciphertext_buf) {
    if (!Buffer.isBuffer(secretkey) || !Buffer.isBuffer(ciphertext_buf)) throw TypeError();
    if (secretkey.length !== 16 || ciphertext_buf.length < 32) throw RangeError();

    var at = ciphertext_buf.slice(0, 16);
    var iv = ciphertext_buf.slice(16, 32);
    var decipher = crypto.createDecipheriv('aes-128-gcm', secretkey, iv);
    var buf_list = [];

    decipher.setAuthTag(at);
    buf_list.push(decipher.update(ciphertext_buf.slice(32)));
    buf_list.push(decipher.final());

    return Buffer.concat(buf_list);
  };

  return {
    hash: hash,
    keygen: keygen,
    sign: sign,
    verify: verify,
    encrypt: encrypt,
    decrypt: decrypt,
  };

})();
