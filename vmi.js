const constants = require('./constants')
const child_process = require('child_process');

exports.get_state = function(proc_name,data){
	try{
		var result = child_process.spawnSync(
			'../libvmi/examples/process-list',
			[constants.DEVICE_NAME,proc_name,data]
		);
	}catch(err){
		return {"status_code":500,"result":err};
	}

	var result_obj = JSON.parse(result.stdout.toString());
	return result_obj;
}