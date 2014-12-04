module.exports = function(log,ip_address) {

	var async = require('async');
	var moment = require('moment');

	var Etcd = require('node-etcd');
	var etcd = new Etcd(ip_address, '4001');

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

	var initialize = function() {

		// Alright let's initialize the app.
		etcd.get(ASTERISK_HOSTS, { recursive: true }, function(err,hosts){

			// Check to see that the directory exists.
			if (err) {
				createRootKey();
			} else {
				if (hosts.node.dir) {
					log.it("found_root_etcd_key","Found existing asterisk directory");
				}
			}

			// Set a watch on the root key.
			watcher = etcd.watcher(ASTERISK_HOSTS, null, {recursive: true});
			
			// Triggers on set operations
			watcher.on("set", function(etcd_event){

				console.log("!trace err/etcd_event",etcd_event);
				// Ok, something changed...
				console.log("Key %s changed to %s",etcd_event.node.key,etcd_event.node.value); // etcd_event.prevNode.value,


				// relead the boxes
				loadAllBoxes();

			});

			// Let's start up by 
			loadAllBoxes();

			// watcher.on("delete", console.log); // Triggers on delete.
			// watcher.on("change", console.log); // Triggers on all changes
			
			// console.log("!trace HOSTS EXIST?",err,hosts);

			// watcherLoop();

		});

	}

	var createRootKey = function(callback) {

		if (typeof callback == 'undefined') {
			callback = function(){}; 
		}

		etcd.mkdir( ASTERISK_HOSTS + "/",function(err){
			log.it("created_root_etcd_key",{msg: "Created asterisk directory."});
			callback(err);
		});

	}

	var terminalKey = function(instr) {
		return instr.replace(/^.+\/(.+)$/,'$1');
	}

	var loadAllBoxes = function() {
		
		// Alright, now let's get that recursively...
		etcd.get(ASTERISK_HOSTS, { recursive: true }, function(err,hosts){
			if (!err) {

				if (hosts.node) {
					if (hosts.node.nodes) {
						boxesToJson(hosts.node.nodes);
					} else {
						log.warn("hosts_incomplete",hosts);
					}
				} else {
					log.warn("hosts_incomplete",hosts);
				}

			} else {

				log.error("etcd_get_rootkey_failed",{err: err});
				createRootKey();

			}

			
		});	

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
				log.it("new_asterisk_host_discovered",{hostname: hostname });
				boxen[hostname] = {};
			}

			// Now let's cycle it's values.
			host.nodes.forEach(function(hostkey){
				var eachkey = terminalKey(hostkey.key);
				boxen[hostname][eachkey] = hostkey.value;
			});

		});

		log.it("boxen_debug",{boxen: boxen});

	};

	var watcherLoop = function() {

	    console.log('foo');

	    // Go into a loop and do this again, and again.
		setTimeout(watcherLoop,LOOP_WAIT);
	};

	initialize();

}

