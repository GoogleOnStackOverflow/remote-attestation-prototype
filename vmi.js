const constants = require('./constants')
const child_process = require('child_process');

exports.get_state = (vm_name,proc_name,data) => {
  try{
    var result = child_process.spawnSync(
      './c_code/my-libvmi-measure',
      [vm_name,proc_name,data]
    );
  }catch(err){
    return {"error":"VM_NOT_FOUND","result":[], "sign":null};
  }
  
  if(result.stdout.toString().indexOf('VM_NOT_FOUND\n') !== -1)
    return {"error":'VM_NOT_FOUND',"result":[], "sign":null};

  if(result.stdout.toString().indexOf('PROC_NOT_FOUND\n') !== -1)
    return {"error":'PROC_NOT_FOUND',"result":[], "sign":null};
  
  var result_arr = result.stdout.toString().split('\n');
  result_arr.pop();
  return {"error":null, "result":result_arr};
}

exports.get_vm_names = () => {
  var result = child_process.execSync('xl list');
  return result;
}

exports.get_proc_list = (vm_name) => {
  try{
    var result = child_process.spawnSync(
      './c_code/my-libvmi-list-proc',
      [vm_name]
    );
  }catch(err){
    console.log(err);
    return {"error":'VM_NOT_FOUND',"procs":[]};
  }

  if(result.stdout.toString().indexOf('VM_NOT_FOUND\n') !== -1)
    return {"error":'VM_NOT_FOUND',"procs":[]};

  var result_arr = result.stdout.toString().split('\n');
  result_arr.pop();

  var result_arr_unq = [];
  result_arr.forEach((e) => {
    if(result_arr_unq.indexOf(e) == -1){
      result_arr_unq.push(e);
    }
  })

  return {"error":null ,"procs":result_arr_unq};;
}