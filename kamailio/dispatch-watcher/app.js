/*

Authored by: Doug Smith <info@laboratoryb.org>
---------------------------------------
A tool to automatically build dynamically load balance asterisk hosts with coreos & etc.
Part of a High Availability setup with Asterisk under coreOS & docker.

Run like:

node app.js 192.168.1.1

Where the IP address is where etcd can be found.

*/

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
	
	// Instantiate our main app.
	var Watcher = require('./watcher.js');
	var watcher = new Watcher(log,ip_address);
	