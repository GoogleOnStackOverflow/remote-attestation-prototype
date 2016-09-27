module.exports = (function(){

  const get_random = function (number_of_bytes) {
    return require('crypto').randomBytes(number_of_bytes);
  };

  const hexadecimal_encode = function (raw_buffer) {
    return raw_buffer.toString('hex');
  };

  const hexadecimal_decode = function (hex_string) {
    return new Buffer(hex_string, 'hex');
  };

  return {
    get_random: get_random,
    hexadecimal_encode: hexadecimal_encode,
    hexadecimal_decode: hexadecimal_decode,
  };

})();
