// node sig_verify.js <nonce> <signature> <hash 0> ... <hash n - 1>

const fs = require('fs');
const constants = require('./constants');
const crypt = require('./crypto');
const util = require('./util');

const main = (sig, nonce, hashes, key_public) => {
  	var expected_alpha = Buffer.concat([].concat([nonce], hashes));
  	if(crypt.verify(key_public, expected_alpha, sig))
      console.log('Signature Verified');
    else
  	  console.log('Signature not legal');
}

var key_public = fs.readFileSync(constants.PATH_TO_PUBLIC_KEY_FILE);
var hex_args = process.argv.slice(2);
var nonce = new Buffer(hex_args[0],'hex');
var sig = new Buffer(hex_args[1],'hex');
var hashes = hex_args.slice(2).map(x => new Buffer(x,'hex'));

main(sig, nonce, hashes, key_public);
