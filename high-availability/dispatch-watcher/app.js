/*

Authored by: Doug Smith <info@laboratoryb.org>
---------------------------------------
A tool to automatically build dynamically load balance asterisk hosts with coreos & etc.
Part of a High Availability setup with Asterisk under coreOS & docker.
Works in both "dispatcher" mode, which sits next to a Kamailio box and watches for Asterisk to announce itself.
And in "announce" mode where it announces to Kamailio that it's available (and pulses heartbeats to it)

You can always get help with:

    node app.js --help

Run an dispatcher like:

    node app.js --etcdhost 192.168.1.1 --timeout 25000

Run an announcer like:

    node app.js --announce --etcdhost 192.168.1.1 --timeout 5500

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
		.option('announce', {
			abbr: 'a',
			flag: true,
			help: 'Start in "announce" mode (defaults to dispatcher mode)'
		})
		.option('heartbeat', {
			abbr: 'h',
			default: 5000,
			help: 'Time between heartbeat pulss [announce mode only] (in milliseconds)'
		})
		.option('listpath', {
			abbr: 'l',
			default: "/etc/kamailio/dispatcher.list",
			help: 'Path of the dispatcher.list file [dispatcher mode only]'
		})
		.parse();

	
	// Create a log object.
	var Log = require('./Log.js');
	var log = new Log();

	// Create the Kamailio object (which writes dispatcher.list files)
	var Kamailio = require('./Kamailio.js');
	var kamailio = new Kamailio(log,opts);

	// ----------------------------------- end ip assign.

	// When do we timeout?
	// 5 seconds for testing...
	var TIMEOUT_AFTER = 5000;
	
	// Instantiate our main app.
	var Dispatcher = require('./Dispatcher.js');
	var dispatcher = new Dispatcher(log,opts,kamailio);
	