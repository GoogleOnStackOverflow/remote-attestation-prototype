const vmi = require('./vmi');
const crypt = require('./crypto');
const assert = require('assert');
const net = require('net');

const test1 = () => {
  var codes_result = [];
  var codes_result_hash = [];
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

  assert(codes_result_hash[0].equals(
    codes_result_hash[6]),
    'Should recognize legal process'
  );

  assert(!codes_result_hash[0].equals(
    codes_result_hash[1]),
    'Should detect static variable init diff'
  );

  assert(!codes_result_hash[0].equals(
    codes_result_hash[2]),
    'Should detect global function return value diff'
  );

  assert(!codes_result_hash[0].equals(
    codes_result_hash[3]),
    'Should detect local variable init value diff'
  );

  assert(!codes_result_hash[0].equals(
    codes_result_hash[4]),
    'Should detect function call diff'
  );

  assert(!codes_result_hash[0].equals(
    codes_result_hash[5]),
    'Should detect variable name diff'
  );

  console.log('Test1 Passed.');
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
      res(vmi.get_state('tcp','stack')['result']['data'].substring(8064,8064+2*test_string.length));
    });
  });
}

const test2 = () => {
  send_tcp_and_get_stack('ABCDEFGGGGG').then(value1 => {
    send_tcp_and_get_stack('abcdeeeeeee').then(value2 => {
      send_tcp_and_get_stack('1234567123').then(value3 => {
        console.log([value1,value2,value3]);
      });
    });
  });
}

//test1();
test2();