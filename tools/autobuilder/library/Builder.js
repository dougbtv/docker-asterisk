module.exports = function(opts,bot) {

	// Constants.
	var ASTERISK_HOST = "downloads.asterisk.org";
	var ASTERISK_URL = "/pub/telephony/certified-asterisk/certified-asterisk-11.6-current.tar.gz";
	var CLONE_PATH = "/tmp/docker-asterisk/";
	var BRANCH_NAME = "autobuild";

	// Our requirements.
	var http = require('http');
	var moment = require('moment');
	var async = require('async');
	var schedule = require('node-schedule');

	var exec = require('child_process').exec;

	/*
		exec("ls -la", function(error, stdout, stderr) {
			console.log(stdout);
		});
	*/

	// Our properties
	this.last_modified = new moment();	// When was the file on server last updated?

	// Our virtual constructor.
	this.instantiate = function() {

		if (opts.forceupdate) {
			this.last_modified = new moment().subtract(20, "years");
			this.logit("Forcing an update on start, set date to: ",this.last_modified.toDate());
		} 

		// Check for update once, then, once it's updated, schedule the job to recur.
		this.checkForUpdate(function(initialupdate){

			console.log("did initial update? ",initialupdate);
			if (initialupdate) {
				this.performUpdate();
			}

			// Create a range
			// that runs every other unit.
			var rule = new schedule.RecurrenceRule();
			rule.minute = [];
			for (var i = 0; i < 60; i++) { 
				if (i % 2 == 0) {
					rule.minute.push(i);
				}
			}

			var j = schedule.scheduleJob(rule, function(){
				this.checkForUpdate(function(updated){

					if (updated) {
						// Ok, kick it off!
						this.performUpdate();
					}

				}.bind(this));
			
			}.bind(this));

		}.bind(this));


	}.bind(this);

	this.performUpdate = function() {

		// Ok, let's handle a new build.
		// Steps:
		// update the git repo
		// pull the dockers
		// build the docker image
		// push the docker image
		this.logit("Beginning update");

		// Let's make a build time for this.
		var buildstamp = new moment().unix();

		async.series([
			function(callback){
				// Let's update our git repository.
				this.gitCloneAndUpdate(buildstamp,function(err){
					callback(err);
				});
			}.bind(this),
			function(callback){
				// do some more stuff ...
				callback(null, 'two');
				
			}.bind(this)
		],function(err,result){
			if (!err) {
				console.log("!trace all done series.");
			} else {
				this.logit("ERROR: Failed to performUpdate -- ",err);
			}
		}.bind(this));

	}

	this.gitCloneAndUpdate = function(buildstamp,callback) {

		// Ok, let's clone the repo, and update it.
		
		async.series([
			// Remove the tempdir if necessary
			function(callback){
				exec("rm -Rf " + CLONE_PATH,function(err){
					callback(err);
				});
			}.bind(this),

			// Clone with git.
			function(callback){
				this.logit("Beginning git clone.");
				var cmd_gitclone = 'git clone https://' + opts.gituser + ':' + opts.gitpassword + '@github.com/' + opts.gitrepo + " " + CLONE_PATH;
				console.log("!trace cmd_gitclone: ",cmd_gitclone);
				exec(cmd_gitclone,function(err,stdout,stderr){
					
					callback(err);
				});
			}.bind(this),

			// 1. Branch from master
			function(callback){
				exec('git checkout -b autobuild', {cwd: CLONE_PATH}, function(err,stdout){
					console.log("!trace branch stdout: ",stdout);
					callback(err);
				});
			},

			function(callback){
				exec('git branch -v', {cwd: CLONE_PATH}, function(err,stdout){
					console.log("!trace branch -v stdout: ",stdout);
					callback(err);
				});
			},

			function(callback){
				exec('git branch -v', {cwd: CLONE_PATH}, function(err,stdout){
					console.log("!trace branch -v stdout: ",stdout);
					callback(err);
				});
			},

			// Alright, that's great, all we need to do is simply.
			
			// 2. Edit the file.
			// 3. Stage changes.
			// 4. commit
			// 5. Push.


		],function(err,result){
			if (!err) {
				this.logit("Successfully cloned and updated");
				callback(null);
			} else {
				var errtxt = "ERROR with the gitCloneAndUpdate: " + err
				this.logit(errtxt);
				callback(errtxt);
			}
		}.bind(this));


		callback();

	}

	this.checkForUpdate = function(callback) {

		var options = {method: 'HEAD', host: ASTERISK_HOST, port: 80, path: ASTERISK_URL};
		var req = http.request(options, function(res) {

			// console.log(JSON.stringify(res.headers));
			var raw_modified = res.headers['last-modified'];
			console.log("!trace raw_modified: ",raw_modified);

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

	this.logit = function(message) {
		console.log("[log message] " + message);
	}

	this.instantiate();

}