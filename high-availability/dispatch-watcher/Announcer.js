module.exports = function(log,opts) {

	var async = require('async');
	var moment = require('moment');

	var Etcd = require('node-etcd');
	var etcd = new Etcd(opts.etcdhost, opts.etcdport);

	var uuid = require('uuid');

	var debug = false;

	/*
	// Generate a v1 (time-based) id
	uuid.v1(); // -> '6c84fb90-12c4-11e1-840d-7b25c5ee775a'

	// Generate a v4 (random) id
	uuid.v4(); // -> '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
	*/

	var heartBeatTick = function() {

		// Alright, gen a UUID and send a heartbeat.
		var unique = uuid.v4();
		etcd.set(boxpath + "heartbeat",unique,function(err){
			if (err) {
				log.error("heartbeat_tick_err",{err: err});
			}
			if (debug) {
				log.it("heartbeat_send",{unique: unique});
			}
			setTimeout(heartBeatTick,opts.heartbeat);
		});

	};

	// Ok, let's make the base path.
	var boxpath = opts.rootkey + "/" + opts.announcename + "/";

	async.series({

		checkroot_key: function(callback){

			// Check and see if the root key exists.
			etcd.get(opts.rootkey, { recursive: true }, function(err,hosts){
				var make_root = false;
				if (err) {
					make_root = true;
				} else {
					if (hosts.node.dir) {
						log.it("found_root_etcd_key","Found existing rootkey");
					} else {
						make_root = true;
					}
				}

				if (make_root) {
					etcd.mkdir( opts.rootkey + "/",function(err){
						log.it("created_root_etcd_key",{msg: "Created rootkey."});
						callback(err);
					});
				} else {
					callback(null);
				}

			});

		},

		make_host_dir: function(callback) {

			etcd.mkdir(boxpath,function(err){

				if (err) {
					log.warn("mkdir_box_path",{err: err});
				}

				// An error is OK? 
				// ...if the box path exists, I'm OK with that.
				callback(null);

			});

		},

		// Now we can set all of it's properties.
		// Do heartbeat last, that's what totally validates it
		// I guess that's a good time to loop it, too.

		announceip: function(callback) {
			etcd.set(boxpath + "ip",opts.announceip,callback);
		},
		announceweight: function(callback) {
			if (opts.weight) {
				etcd.set(boxpath + "weight",opts.weight,callback);
			} else {
				callback(null);
			}
		},
		announceport: function(callback) {
			if (opts.announceport) {
				etcd.set(boxpath + "port",opts.announceport,callback);
			} else {
				callback(null);
			}
		},

		// We need a semaphore to say that we're done.
		announce_complete: function(callback) {
			etcd.set(boxpath + "complete","true",callback);
		},
			
	},function(err,result){

		log.it("box_announced",{
			name: opts.announcename,
			ip: opts.announceip,
			weight: opts.weight,
			port: opts.announceport,
		});

		if (err) {
			log.error("announce_box",{err: err, result: result});
		} else {
			// That should be OK now we can kick off the heartbeat process.
			heartBeatTick();
		}

	});


}