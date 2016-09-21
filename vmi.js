/*
vmi.js

    get_state               () -> Buffer
    return not signed state of the machine
*/
var constants = require('./constants')

exports.get_state = function(){
	return constants.DEVICE_INTERNAL_STATE;
}