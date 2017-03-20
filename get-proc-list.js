const request = require('request');
const fs = require('fs');
const crypt = require('./crypto');
const util = require('./util');
const constants = require('./constants')

const host_ip = '192.168.56.2';
const host_port = 3000;

const proc_list_request = (vm_name) => {
	var options = {
  		uri: `http://${host_ip}:${host_port}/list-proc/`,
  		method: 'POST',
  		json: {"vm":vm_name}
	};

	request(options, function (error, response, body) {
  		if(!body.error)
    		console.log(body.procs);
    	else
    		console.log(body.error);
	});
}

proc_list_request('ubud1');
proc_list_request('hahaha');