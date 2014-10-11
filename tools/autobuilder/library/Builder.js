module.exports = function() {

	// Constants.
	var ASTERISK_HOST = "downloads.asterisk.org";
	var ASTERISK_URL = "/pub/telephony/certified-asterisk/certified-asterisk-11.6-current.tar.gz";

	// Our requirements.
	var http = require('http');
	var moment = require('moment');
	var async = require('async');
	var schedule = require('node-schedule');

	// Our properties
	this.last_modified = new moment();

	// Our virtual constructor.
	this.instantiate = function() {

		console.log("!trace here we begin.");

		// Ok, parse the options
		this.parseOptions();

		// Check for update once, then, once it's updated, schedule the job to recur.
		this.checkForUpdate(function(){

			console.log("did initial update.");

		}.bind(this));

		var rule = new schedule.RecurrenceRule();
		rule.minute = [56,57];

		var j = schedule.scheduleJob(rule, function(){
			this.checkForUpdate(function(updated){

				if (updated) {
					console.log("!trace we're about to update!");
				}

			}.bind(this));
		}.bind(this));

		
	}

	this.checkForUpdate = function(callback) {

		var options = {method: 'HEAD', host: ASTERISK_HOST, port: 80, path: ASTERISK_URL};
		var req = http.request(options, function(res) {

			// console.log(JSON.stringify(res.headers));
			var raw_modified = res.headers['last-modified'];
			// console.log("!trace raw_modified: ",raw_modified);

			// Ok, let's parse that date.
			// Thu, 18 Sep 2014 18:40:20
			var pts = raw_modified.split(" ");
			// console.log("!trace pts: ",pts);

			var day = pts[1];
			var mon = pts[2];
			var year = pts[3];

			var tpts = pts[4].split(":");
			var hour = tpts[0];
			var minute = tpts[1];
			var second = tpts[2];

			var last_modified = new moment().year(year).month(mon).date(day).hour(hour).minute(minute).second(second).add(4,"hours");
			// console.log("!trace last-modified: ",last_modified.toDate());

			// Do we have an update?
			var is_update = false;

			// Is it different from the last date?
			if (last_modified.unix() > this.last_modified.unix()) {
				// console.log("!trace IT'S GREATER.");
				is_update = true;
			}

			// Set the update.
			this.last_modified = last_modified;

			
			callback(is_update);

		}.bind(this));
		req.end();

	}.bind(this);

	// Get the options read.

	this.parseOptions = function(callback) {

		var opts = require("nomnom")
			/* .option('config', {
				abbr: 'c',
				default: 'config.json',
				help: 'JSON file with tests to run'
			}) */
			.option('forceupdate', {
				flag: true,
				help: 'Force an update automatically.'
			})
			.parse();

		if (opts.forceupdate) {
			this.last_modified = new moment().subtract(20, "years");
			console.log("Forcing an update on start, set date to: ",this.last_modified.toDate());
		}


	}.bind(this);

	this.instantiate();

}