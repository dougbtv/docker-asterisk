module.exports = function(log,opts,kamailio) {

	var async = require('async');
	var moment = require('moment');

	var Etcd = require('node-etcd');
	var etcd = new Etcd(opts.etcdhost, opts.etcdport);

	log.it("set_etcd_host",{host: opts.etcdhost, port: opts.etcdport});
	log.it("timeout_set",{milliseconds: opts.timeout});

	var LOOP_WAIT = 2500;
	var DELAY_CLUSTER_SYNC = 1250;

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
	this.boxen = {};

	var initialLoad = function() {
		// Let's start up by loading all the boxes.
		log.it("initial_load");
		loadAllBoxes(function(){
			// Start a loop watching the heart beat
			checkPulse();				
		});
	}

	var initialize = function() {

		// Alright let's initialize the app.
		etcd.get(opts.rootkey, { recursive: true }, function(err,hosts){

			// Check to see that the directory exists.
			// And start our initial load at the right time.
			if (err) {
				createRootKey(function(){
					initialLoad();
				});
			} else {
				if (hosts.node.dir) {
					log.it("found_root_etcd_key","Found existing asterisk directory");
				}
				initialLoad();
			}

			// Set a watch on the root key.
			watcher = etcd.watcher(opts.rootkey, null, {recursive: true});
			
			// Triggers on set operations
			watcher.on("set", function(etcd_event){

				// console.log("!trace --------------------------------------- SET ACTION: %j",etcd_event);

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
					
					// A heartbeat pulse.
					case "heartbeat":
						updateHeartBeat(etcd_event.node.key);
						break;

					// Our semaphore to say a new box came online.
					case "complete":
						log.it("host_joined_cluster",{key_found: etcd_event.node.key });
						loadAllBoxes();
						break;
					
				}

			});

			// Other events to watch, if need be.
			// watcher.on("delete", console.log); // Triggers on delete.
			// watcher.on("change", console.log); // Triggers on all changes
			

		});

	}.bind(this);

	var checkPulse = function() {

		async.waterfall([

			function(callback){

				var deleters = [];

				for (var boxkey in this.boxen){
					if (this.boxen.hasOwnProperty(boxkey)) {
						
						// console.log("!trace boxkey is " + boxkey + ", value is %j",this.boxen[boxkey]);
						var box = this.boxen[boxkey];
						
						if (box.last_update) {
							// It has a last update
							var now_moment = new moment();
							var last_beat = now_moment.diff(box.last_update);
							if (last_beat > opts.timeout) {
								// Uh oh, that box is down.
								log.it("box_down",{box: boxkey, last_update: box.last_update.toDate()});
								// We need to process this somehow, too.
								// Let's tear down it's key.
								

								// We can delete this mother.
								deleters.push(boxkey);

							}
							
							// console.log("!trace LAST HEART BEAT: ",last_beat,boxkey);

						} else {
							log.warn("box_missing_heartbeat",{ box: boxkey});
						}

					}
				}

				callback(null,deleters);

			}.bind(this),

			function(deleters,callback){

				if (!deleters) {

					// Nothing to do...
					callback(null);

				} else {

					// Remove from etcd.
					// ...we remove from our own data structure at the end of the waterfall.
					if (deleters.length) {
						async.each(deleters,function(box,cb){
		
							log.it("etcd_removing_host",{box: box});
							etcd.del( opts.rootkey + "/" + box + "/", { recursive: true }, function(err){
								cb(err);	
							});
		
						},function(err){

							// report back with just deleters.
							callback(err,deleters);

						});

					} else {
						callback(null,deleters);
					}

				}

			}.bind(this),

		],function(err,deleters){

			// Just keep the boxes we want...
			// delete object[key] was giving me fits.
			if (deleters.length) {
				var new_boxen = {};
				for (var boxkey in this.boxen){
					if (this.boxen.hasOwnProperty(boxkey)) {
						var box = this.boxen[boxkey];
						if (deleters.indexOf(boxkey) == -1) {
							// We keep that.
							new_boxen[boxkey] = box;
						}
					}
				}
				this.boxen = new_boxen;
				
				// Ok to reload now.
				// So.... It seems the delete functionality takes a bit to sync with the cluster.
				// So I think I should delay this with a timeout.
				setTimeout(function(){
					loadAllBoxes(function(){
						// Go into a loop and do this again, and again.
						setTimeout(checkPulse,LOOP_WAIT);
					});
				},DELAY_CLUSTER_SYNC);
			} else {
				setTimeout(checkPulse,LOOP_WAIT);
			}

		}.bind(this));

	}.bind(this);

	var updateHeartBeat = function(key) {

		var pts = key.split("/");

		var boxidx = pts[2];

		if (typeof this.boxen[boxidx] != 'undefined') {

			this.boxen[boxidx].last_update = new moment();

			// This is noisy.
			// log.it("heartbeat_updated",{box: boxidx});

		} else {
			log.warn("premature_heartbeat",{box: boxidx, fullkey: key }); // keysplit: pts
		}
		

	}.bind(this);

	var createRootKey = function(callback) {

		if (typeof callback == 'undefined') {
			callback = function(){}; 
		}

		etcd.mkdir( opts.rootkey + "/",function(err){
			log.it("created_root_etcd_key",{msg: "Created asterisk directory."});
			setTimeout(function(){
				callback(err);
			},DELAY_CLUSTER_SYNC);
		});

	}.bind(this);

	var terminalKey = function(instr) {
		return instr.replace(/^.+\/(.+)$/,'$1');
	}.bind(this);

	var loadAllBoxes = function(callback) {

		if (typeof callback == 'undefined') {
			callback = function(){};
		}

		// Alright, now let's get that recursively...
		etcd.get(opts.rootkey, { recursive: true }, function(err,hosts){

			var convert_nodes = {};

			if (!err) {

				if (hosts.node) {
					
					if (hosts.node.nodes) {
						convert_nodes = hosts.node.nodes;
					} else {
						log.warn("no_host_nodes_found",hosts);
					}
					
				} else {
					log.warn("no_hosts_found",hosts);
				}

			} else {
				log.warn("etcd_rootkey_missing",{err: err.error});
			}

			boxesToJson(convert_nodes);
			kamailio.createList(this.boxen,function(err){
				if (!err) {
					// That's a success.
					// log.it("kamailo_createlist",{success: true});
				} else {
					log.error("kamailo_createlist",{err: err});
				}
				callback(err);
			});

		}.bind(this));	

	}.bind(this);

	var boxesToJson = function(hosts) {

		// console.log("!trace hosts: ",hosts);

		for (var i = 0; i < hosts.length; i++) {

			var host = hosts[i];
		
			// Get the box name.
			var hostname = terminalKey(host.key);
			// console.log("!trace HOSTNAME: ",hostname);
			// console.log("!trace this.boxen: ",this.boxen);
			// console.log("!trace host: %j",host);

			// Is this key set?
			if (typeof this.boxen[hostname] == 'undefined') {
				// It's not, let's set it
				this.boxen[hostname] = {};
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

					this.boxen[hostname][eachkey] = hostkey.value;
				}.bind(this));

			} else {

				log.warn("boxes_nodes_incomplete",{error: "whaaaaat, bummer."});

			}

		};

		// log.it("this.boxen_debug",{this.boxen: this.boxen});
		// callback(this.boxen);
		return;

	}.bind(this);

	initialize();

}

