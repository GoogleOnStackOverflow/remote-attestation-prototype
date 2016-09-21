/*

crypto.js

    hash                    Buffer -> Buffer

        SHA-256

    keygen                  () -> Buffer x Buffer
    sign                    Buffer x Buffer -> Buffer
    verify                  Buffer x Buffer x Buffer -> Boolean

        ECDSA P-256

    encrypt                 Buffer x Buffer -> Buffer
    decrypt                 Buffer x Buffer -> Buffer  (maybe exception)

        AES-128-CBC

*/

const child_process = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util');


var hash = function (message) {
  // TODO
  var hashed_message = new Buffer();
  return hashed_message;
};

var keygen = exports.keygen = function () {
  const TMPDIR = os.tmpdir();

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

  const private_key_buffer = fs.readFileSync(path.join(TMPDIR, 'sk'));
  const public_key_buffer = fs.readFileSync(path.join(TMPDIR, 'pk'));

  return [private_key_buffer, public_key_buffer];
};

var sign = function (private_key, message) {
  // TODO
  var signature = new Buffer();
  return signature;
};

var verify = function (public_key, message, signature) {
  // TODO
  var result = false;
  return result;
};

var encrypt = function (secret_key, message) {
  // TODO
  var encrypted_result = new Buffer();
  return encrypted_result;
};

var decrypt = function (secret_key, blob) {
  // TODO
  var decrypted_result = new Buffer();
  return decrypted_result;
};
