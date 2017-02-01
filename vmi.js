const constants = require('./constants')
const child_process = require('child_process');

exports.get_state = function(proc_name,data){
	try{
		var result = child_process.spawnSync(
			'./c_code/getdata',
			[constants.DEVICE_NAME,proc_name,data]
		);
	}catch(err){
		return {"status_code":500,"result":err};
	}

	//console.log(result)
	var result_obj = JSON.parse(result.stdout.toString());
	console.log(result_obj["status_code"]);
	console.log(result_obj["result"]);
	return result_obj;
}