/*
device.js
    main                    () -> ()
*/
const network = require('./net');

const main = function(){
	network.start_http_server();	
};

main();