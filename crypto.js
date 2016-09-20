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

var hash = function (message) {
  // TODO
  var hashed_message = new Buffer();
  return hashed_message;
};

var keygen = function () {
  // TODO
  var private_key = new Buffer();
  var public_key = new Buffer();
  return [private_key, public_key];
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
