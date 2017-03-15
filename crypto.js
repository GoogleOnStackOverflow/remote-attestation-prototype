module.exports = (function(){

  const assert = require('assert');
  const crypto = require('crypto');

  const hash = function (message_buf) {
    return crypto.createHash('sha256').update(message_buf).digest();
  };

  const armor = function (heading_str, body_raw_data) {
    return Buffer.from(
      [].concat(
        ['-----BEGIN ' + heading_str + '-----'],
        body_raw_data.toString('base64').match(/.{1,64}/g),
        ['-----END ' + heading_str + '-----', '']
      ).join('\n'), 'utf8'
    );
  };

  const keygen = function () {
    const ecdh = require('crypto').createECDH('secp256k1');
    const pk = ecdh.generateKeys();
    const sk = ecdh.getPrivateKey();

    const sk_ = Buffer.concat([
      Buffer.from('30740201010420', 'hex'),
      sk,
      Buffer.from('a00706052b8104000aa144034200', 'hex'),
      pk
    ]);
    const pk_ = Buffer.concat([
      Buffer.from('3056301006072a8648ce3d020106052b8104000a034200', 'hex'),
      pk
    ]);

    const private_key_buf = armor('EC PRIVATE KEY', sk_);
    const public_key_buf = armor('PUBLIC KEY', pk_);
    return [private_key_buf, public_key_buf];
  };

  const sign = function (private_key_buf, message_buf) {
    const signobj = crypto.createSign('sha256');
    signobj.update(message_buf);
    return signobj.sign(private_key_buf.toString());
  };

  const verify = function (public_key_buf, message_buf, signature_buf) {
    const verifyobj = crypto.createVerify('sha256');
    verifyobj.update(message_buf);
    return verifyobj.verify(public_key_buf.toString(), signature_buf);
  };

  const encrypt = function (secretkey, plaintext_buf) {
    assert(Buffer.isBuffer(secretkey) &&
           Buffer.isBuffer(plaintext_buf) &&
           secretkey.length === 16);

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-128-gcm', secretkey, iv);
    const buf_list = [];

    buf_list.push(iv);
    buf_list.push(cipher.update(plaintext_buf));
    buf_list.push(cipher.final());
    buf_list.unshift(cipher.getAuthTag());

    return Buffer.concat(buf_list);
  };

  const decrypt = function (secretkey, ciphertext_buf) {
    assert(Buffer.isBuffer(secretkey) &&
           Buffer.isBuffer(ciphertext_buf) &&
           secretkey.length === 16 &&
           ciphertext_buf.length >= 32);

    const at = ciphertext_buf.slice(0, 16);
    const iv = ciphertext_buf.slice(16, 32);
    const decipher = crypto.createDecipheriv('aes-128-gcm', secretkey, iv);
    const buf_list = [];

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
