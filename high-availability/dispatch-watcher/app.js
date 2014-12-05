/*

Authored by: Doug Smith <info@laboratoryb.org>
---------------------------------------
A tool to automatically build dynamically load balance asterisk hosts with coreos & etc.
Part of a High Availability setup with Asterisk under coreOS & docker.

Run like:

node app.js --etcdhost 192.168.1.1 --timeout 20000

Where the IP address is where etcd can be found.
or get help with:

node app.js --help

*/

	var opts = require("nomnom")
		.option('etcdhost', {
			abbr: 'e',
			default: '127.0.0.1',
			help: 'Set etcd host or ip address'
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

	// ----------------------------------- end ip assign.

	// When do we timeout?
	// 5 seconds for testing...
	var TIMEOUT_AFTER = 5000;
	
	// Instantiate our main app.
	var Watcher = require('./watcher.js');
	var watcher = new Watcher(log,opts);
	