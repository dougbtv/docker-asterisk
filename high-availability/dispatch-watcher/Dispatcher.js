module.exports = function(log,opts,kamailio) {

	var async = require('async');
	var moment = require('moment');

	var Etcd = require('node-etcd');
	var etcd = new Etcd(opts.etcdhost, opts.etcdport);

	log.it("etcd_host",{host: opts.etcdhost});
	log.it("timeout_set",{milliseconds: opts.timeout});

	var LOOP_WAIT = 1000;

	/*

	Example keys:

	key                         value
	-----------------------------------------------------------------
	asterisk/
	asterisk/box1
	asterisk/box1/ip			192.168.1.100
	asterisk/box1/port			5060
	asterisk/box1/heartbeat		110ec58a-a0f2-4ac4-8393-c866d813b8d1
	asterisk/box1/weight		15
	asterisk/box2
	asterisk/box2/ip			192.168.1.101
	asterisk/box3

	Into json:

	var thing = {
		box1: {
			ip: 192.168.1.100,
			port: 5060,
			weight: 15,
			heartbeat: {uuid}
		},
		box2: {
			ip: 192.168.1.101,
			heartbeat: {uuid}
		}
	}

	*/

	// Our boxes.
	var boxen = {};

	var initialize = function() {

		// Alright let's initialize the app.
		etcd.get(opts.rootkey, { recursive: true }, function(err,hosts){

			// Check to see that the directory exists.
			if (err) {
				createRootKey();
			} else {
				if (hosts.node.dir) {
					log.it("found_root_etcd_key","Found existing asterisk directory");
				}
			}

			// Set a watch on the root key.
			watcher = etcd.watcher(opts.rootkey, null, {recursive: true});
			
			// Triggers on set operations
			watcher.on("set", function(etcd_event){

				// Ok, something changed...
				// console.log("!trace err/etcd_event",etcd_event);
				// console.log("Key %s changed to %s",etcd_event.node.key,etcd_event.node.value); // etcd_event.prevNode.value,

				// We only update all boxes when it's not the heartbeat.
				// ...unless it's the first heartbeat (let the heartbeat handle determine this.)
				// Other properties require re-writing the list
				// However heart-beat is essentially no-change.
				// As opposed to heartbeat failure... which is handled in the repeating loop to check pulse.

				var termkey = terminalKey(etcd_event.node.key);
				// console.log("!trace key set: ",etcd_event.node.key);
				switch (termkey) {
					case "heartbeat":
						updateHeartBeat(etcd_event.node.key);
						break;
					default:
						// relead the boxes
						loadAllBoxes();
						break;
				}

			});

			// Let's start up by loading all the boxes.
			loadAllBoxes();

			// Start a loop watching the heart beat
			checkPulse();

			// Other events to watch, if need be.
			// watcher.on("delete", console.log); // Triggers on delete.
			// watcher.on("change", console.log); // Triggers on all changes
			

		});

	}

	var checkPulse = function() {

		var deleters = [];
		for (var boxkey in boxen){
			if (boxen.hasOwnProperty(boxkey)) {
				
				// console.log("boxkey is " + boxkey + ", value is" + boxen[boxkey]);
				var box = boxen[boxkey];
				
				if (box.last_update) {
					// It has a last update
					var now_moment = new moment();
					var last_beat = now_moment.diff(box.last_update);
					if (last_beat > opts.timeout) {
						// Uh oh, that box is down.
						log.it("box_down",{box: boxkey, last_update: box.last_update.toDate()});
						// We need to process this somehow, too.
						// Let's tear down it's key.
						etcd.del( opts.rootkey + "/" + boxkey + "/", { recursive: true }, function(err){
							if (err) {
								log.error("delete_host_error",{err: err});
							}
						});

						// We can delete this mother.
						deleters.push(boxkey);

					}
					
					// console.log("!trace LAST HEART BEAT: ",last_beat,boxkey);

				} else {
					console.warn("box_missing_heartbeat",{ box: boxkey});
				}

			}
		}

		// Remove from boxen when we're deleting.
		if (deleters.length) {
			deleters.forEach(function(box){
				log.it("etcd_removed_host",{box: box});
				delete boxen[box];	
			});

			// Ok, after a box is removed, we need to load all boxes.
			loadAllBoxes();

		}

		// Go into a loop and do this again, and again.
		setTimeout(checkPulse,LOOP_WAIT);
	};

	var updateHeartBeat = function(key) {

		var pts = key.split("/");

		var boxidx = pts[2];

		if (typeof boxen[boxidx] != 'undefined') {

			// On the first update, we need to load all boxes.
			var perform_update = false;
			if (!boxen[boxidx].last_update) {
				perform_update = true;
			}
			boxen[boxidx].last_update = new moment();

			// This is noisy.
			// log.it("heartbeat_updated",{box: boxidx});

			if (perform_update) {
				loadAllBoxes();
			}

		} else {
			log.error("key_not_found",{box: boxidx, fullkey: key, keysplit: pts});
		}
		

	}

	var createRootKey = function(callback) {

		if (typeof callback == 'undefined') {
			callback = function(){}; 
		}

		etcd.mkdir( opts.rootkey + "/",function(err){
			log.it("created_root_etcd_key",{msg: "Created asterisk directory."});
			callback(err);
		});

	}

	var terminalKey = function(instr) {
		return instr.replace(/^.+\/(.+)$/,'$1');
	}

	var loadAllBoxes = function() {
		
		// Alright, now let's get that recursively...
		etcd.get(opts.rootkey, { recursive: true }, function(err,hosts){
			if (!err) {

				if (hosts.node) {
					if (hosts.node.nodes) {
						boxesToJson(hosts.node.nodes,function(allboxes){
							kamailio.createList(allboxes,function(err){
								if (err) {
									log.error("kamailo_createlist",{err: err});
								} else {
									log.it("kamailo_createlist",{success: true});
								}
							});
						});
					} else {
						log.warn("no_hosts_found",hosts);
					}
				} else {
					log.warn("no_hosts_found",hosts);
				}

			} else {

				log.error("etcd_get_rootkey_failed",{err: err});
				createRootKey();

			}

			
		});	

	}

	var boxesToJson = function(hosts,callback) {

		if (typeof callback == 'undefined') {
			callback = function(){};
		}

		// console.log("!trace hosts: ",hosts);

		hosts.forEach(function(host){

			// Get the box name.
			var hostname = terminalKey(host.key);
			// console.log("!trace HOSTNAME: ",hostname);
			// console.log("!trace host: %j",host);

			// Is this key set?
			if (typeof boxen[hostname] == 'undefined') {
				// It's not, let's set it
				log.it("new_asterisk_host_discovered",{hostname: hostname });
				boxen[hostname] = {};
			}

			if (host.nodes) {

				// Now let's cycle it's values.
				host.nodes.forEach(function(hostkey){
					var eachkey = terminalKey(hostkey.key);

					switch (eachkey) {
						case "heartbeat":
							updateHeartBeat(hostkey.key);
							break;
						default:
							// Nothing necessary.
							break;
					}

					boxen[hostname][eachkey] = hostkey.value;
				});

			} else {

				log.warn("boxes_nodes_incomplete",{error: "whaaaaat, bummer."});

			}
		});

		log.it("boxen_debug",{boxen: boxen});
		callback(boxen);

	};

	initialize();

}

