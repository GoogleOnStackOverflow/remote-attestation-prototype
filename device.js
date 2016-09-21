/*
device.js
    main                    () -> ()
*/
const network = require('./net');

const main = () => {
	network.start_http_server();	
};

main();