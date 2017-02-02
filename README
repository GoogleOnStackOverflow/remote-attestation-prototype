# Remote Attestation Prototype
This is a quick prototype for a small remote attestation project

##How to use
###Installation
####Xen 
Dom-0 and Dom-1
[Install Xen on Ubuntu](https://help.ubuntu.com/community/Xen)

####LibVMI
[Install Libvmi](http://libvmi.com/docs/gcode-install.html)
```
git clone https://github.com/libvmi/libvmi.git
cd libvmi
./autogen.sh
./configure
```
After configuring, check if Xen support is enabled
If you got messages like:
```
Xen Support  | --enable-xen=no           | missing xenstore
```
try `apt-get install libxen-dev`.

```
make
make install
```

Note that you should place libvmi and this prototype under the same path to make it work.


###Preparation
First clone it on both Dom-0 and Dom-1
```
git clone https://github.com/GoogleOnStackOverflow/remote-attestation-prototype.git -b xen-libvmi
```

#####Dom-1 (Target VM)
We should first get the needed offsets on Dom-1 using the kernel module
```
cd remote-attestation-prototype/c_code/dom1/linux-offset-finder/
make
insmod findoffsets.ko
```
Copy the kernel logs to the file /etc/libvmi.conf in Dom-0

To remove the kernel module
```
rmmod findoffsets
```
Don'nt forget to copy the sysmap to Dom-1, too.
The sysmap is usually under `/boot`
More information [here](http://libvmi.com/docs/gcode-install.html), see the `Configuring LibVMI` topic.

Next we should build and start the target processes.
```
cd remote-attestation-prototype/c_code/dom1/target_process
mkdir bin #if the path doesn't exists
make
./exec.sh
```

Preparation on Dom-1 is then done.


After testing, if you want to stop the target processes at once
```
./stop.sh
```

#####Dom-0 (Tester)
Then you should build the libvmi code for getting data from Dom-1, A clear makefile is still underworking. Let's use the makefile provided by libvmi first.
```
cp ./remote-attestation-prototype/c_code/get_data.c ./libvmi/examples/process-list.c
cd libvmi
make
```

Don't forget to set the /etc/libvmi.conf file right and copy the sysmap of Dom-1 to Dom-0.

###Start the Tests
Then we can start the tests now
```
node vmi_tester.js
```
#####Tests Details
1. Code
	The tester would check if the hash value same or different when testing the same/different processes.

	Here we compile trivial twice into trivial and trivial_6

2. Realtime stack memory
	The tester would send random bytes to the echo tcp server on Dom1, then check if the message correctly saved in the buffer on the stack.

See `c_code/dom1/target_process` and `vmi_tester.js` for more information

###APIs
C program and javascript API are provided
To use C program, try
```
./libvmi/examples/process-list <Domain Name> <Target Process Name> <Data>
```
Note we build our own program to instead the original process-list in the preparation step.
The Data argument here can be `code`,`data`,`heap`,`stack`
The stdout would be a JSON string
{"status_code":<Number>, "result":[Object]|<String when error>}

To use javascript API
```javascript
const vmi = require(./vmi)
vmi.get_data(<Domain name>,<Data>);
```

The return value is an object
```
{
	"status_code": <Number>,
	"result":[object]
}
```

