/*

Authored by: Doug Smith <info@laboratoryb.org>
---------------------------------------
A tool to automatically build dynamically load balance asterisk hosts with coreos & etc.
Part of a High Availability setup with Asterisk under coreOS & docker.

Run like:

node app.js --ipaddress 192.168.1.1 --timeout 20000

Where the IP address is where etcd can be found.
or get help with:

node app.js --help

*/

	var opts = require("nomnom")
		.option('ipaddress', {
			abbr: 'i',
			default: '127.0.0.1',
			help: 'Set etcd ip address'
		})
		.option('timeout', {
			abbr: 't',
			default: 20000,
			help: 'Timeout before heartbeat pulse check fails (in milliseconds)'
		})
		.parse();

	
	// Create a log object.
	var Log = require('./Log.js');
	var log = new Log();

	// --------------------------------
	// Assign a custom etcd IP address as the first argument.
	var ip_address;
	var found_ip = false;
	process.argv.forEach(function(arg){
		if (arg.match(/\d+\./)) {
			found_ip = true;
			ip_address = arg;
		}
	});

	if (!found_ip) {
		ip_address = '127.0.0.1';
	}

	log.it("etcd_ipaddress",{ip_address: ip_address});

	// ----------------------------------- end ip assign.

	// When do we timeout?
	// 5 seconds for testing...
	var TIMEOUT_AFTER = 5000;
	
	// Instantiate our main app.
	var Watcher = require('./watcher.js');
	var watcher = new Watcher(log,opts);
	