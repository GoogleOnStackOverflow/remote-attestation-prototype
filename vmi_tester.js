const vmi = require('./vmi');
const crypt = require('./crypto');
const util = require('./util');
const assert = require('assert');
const net = require('net');
const constants = require('./constants')

const test1 = () => {
  var codes_result = [];
  var codes_result_hash = [];
  var pass = true;
  codes_result.push(vmi.get_state('trivial','code'))
  console.log("Retrieving Data from Dom-1");
  for(var i=1; i<7; i++)
    codes_result.push(vmi.get_state(('trivial_' + i.toString()),'code'))
  for(var i=0; i<codes_result.length; i++){
    assert(codes_result[i]['status_code']===200, 'Error when retrieving data');
    console.log(codes_result[i]['result']['name'] + ':')
    codes_result_hash.push(crypt.hash(codes_result[i]['result']['data']));
    console.log('\t' + codes_result_hash[i].toString('hex'));
  }

  if(!codes_result_hash[0].equals(codes_result_hash[6])){
    console.log('Error: Should recognize legal process');
    pass = false;
  }
  if(codes_result_hash[0].equals(codes_result_hash[1])){
    console.log('Error: Should detect static variable init diff');
    pass = false;
  }

  if(codes_result_hash[0].equals(codes_result_hash[2])){
    console.log('Error: Should detect global function return value diff');
    pass = false;
  }

  if(codes_result_hash[0].equals(codes_result_hash[3])){
    console.log('Error: Should detect local variable init value diff');
    pass = false;
  }

  if(codes_result_hash[0].equals(codes_result_hash[4])){
    console.log('Error: Should detect function call diff');
    pass = false;
  }

  if(codes_result_hash[0].equals(codes_result_hash[5])){
    console.log('Error: Should detect variable name diff');
    pass = false;
  }

  if(pass)
    console.log('Test1 Passed.');
  else
    console.log('Test1 Failed.');
}

const send_tcp_and_get_stack = (test_string) => {
  return new Promise((res, rej) => {
    var client = new net.Socket();
    client.connect(1234, '10.0.2.16', function() {
      console.log('Connected');
      client.write(test_string);
    });

    client.on('data', function(data) {
      console.log('Received: ' + data);
      client.destroy(); // kill client after server's response
    });

    client.on('close', function() {
      console.log('Connection closed');
      console.log("Retrieving Data from Dom-1");
      res(vmi.get_state('tcp','stack')['result']['data']);
    });
  });
}

const test2 = () => {
  return new Promise((res, rej) => {
    var rand_bytes_1 = util.hexadecimal_encode(util.get_random(32));
    var rand_bytes_2 = util.hexadecimal_encode(util.get_random(32));

    send_tcp_and_get_stack(rand_bytes_1).then(value1 => {
      console.log("Retrieving Data Done");
      send_tcp_and_get_stack(rand_bytes_2).then(value2 => {
        console.log("Retrieving Data Done");
        send_tcp_and_get_stack(rand_bytes_1).then(value3 => {
          console.log("Retrieving Data Done");
          res([
            value1.indexOf(Buffer(rand_bytes_1).toString('hex')),
            value2.indexOf(Buffer(rand_bytes_2).toString('hex')),
            value3.indexOf(Buffer(rand_bytes_2).toString('hex'))
          ]);
        });
      });
    });
  });
}

test1();
test2().then(result => {
  var pass = true
  if(result[0] !== result[1]){
    console.log('Error: The offset should be the same');
    pass = false;
  }
  if(result[2] !== -1){
    console.log('Error: Should not find the pattern');
    pass = false;
  }
  if(result[0] === -1 || result[1] === -1){
    console.log('Error: Should find pattern after first recieved')
    pass = false;
  }
  if(pass)
    console.log('Test2 Passed.');
  else
    console.log('Test2 Failed.');
});