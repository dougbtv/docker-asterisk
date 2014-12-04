var async = require('async');
var moment = require('moment');

var Etcd = require('node-etcd');
var etcd = new Etcd('127.0.0.1', '4001');

var ASTERISK_HOSTS = "asterisk";
var LOOP_WAIT = 1000;

/*

Example keys:

asterisk/
asterisk/box1
asterisk/box1/ip/192.168.1.100
asterisk/box1/heartbeat/11293847289734
asterisk/box2
asterisk/box3

Into json:

var thing = [
	box1: {
		ip: 192.168.1.100,
		heartbeat: {uuid}
	},
	box2: {
		ip: 192.168.1.101,
		heartbeat: {uuid}
	}
]

*/

// Our boxes.
var boxen = {};

var terminalKey = function(instr) {
	return instr.replace(/^.+\/(.+)$/,'$1');
}

var boxesToJson = function(hosts,callback) {

	// console.log("!trace hosts: ",hosts);

	hosts.forEach(function(host){

		// Get the box name.
		var hostname = terminalKey(host.key);
		console.log("!trace HOSTNAME: ",hostname);
		console.log("!trace host: %j",host);

		// Is this key set?
		if (typeof boxen[hostname] == 'undefined') {
			// It's not, let's set it
			console.log("Discovered new box: ",hostname);
			boxen[hostname] = {};
		}

		// Now let's cycle it's values.
		host.nodes.forEach(function(hostkey){
			var eachkey = terminalKey(hostkey.key);
			boxen[hostname][eachkey] = hostkey.value;
		});

	});

	console.log("!trace boxen: ",JSON.stringify(boxen, null, '\t'));

};

var watcherLoop = function() {

    console.log('foo');

    // Go into a loop and do this again, and again.
	setTimeout(watcherLoop,LOOP_WAIT);
};

etcd.get(ASTERISK_HOSTS, { recursive: true }, function(err,hosts){

	// Check to see that the directory exists.
	if (err) {
		console.log("!trace ast hosts: ",ASTERISK_HOSTS);
		etcd.mkdir( ASTERISK_HOSTS + "/",function(){
			console.log("Created asterisk directory.");
		});
	} else {
		if (hosts.node.dir) {
			console.log("Found existing asterisk directory");
		}
	}

	watcher = etcd.watcher(ASTERISK_HOSTS, null, {recursive: true});
	
	// Triggers on specific changes (set ops)
	watcher.on("set", function(evt){

		// console.log("!trace err/evt",evt);
		// Ok, something changed...
		console.log("Key %s changed to %s",evt.node.key,evt.node.value); // evt.prevNode.value,

		// Alright, now let's get that recursively...
		etcd.get(ASTERISK_HOSTS, { recursive: true }, function(err,hosts){
			if (err) {
				console.log("ERROR: ",err);
			}

			// console.log("!trace hosts:", hosts.node);
			boxesToJson(hosts.node.nodes);
		});		

	});

	// watcher.on("delete", console.log); // Triggers on delete.
	// watcher.on("change", console.log); // Triggers on all changes
	
	// console.log("!trace HOSTS EXIST?",err,hosts);

	// watcherLoop();

});



