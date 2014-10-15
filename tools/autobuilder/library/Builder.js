module.exports = function(opts,bot) {

	// Constants.
	var ASTERISK_HOST = "downloads.asterisk.org";
	var ASTERISK_URL = "/pub/telephony/certified-asterisk/certified-asterisk-11.6-current.tar.gz";
	var CLONE_PATH = "/tmp/docker-asterisk/";
	var BRANCH_NAME = "autobuild";
	var BRANCH_MASTER = "master";

	// Our requirements.
	var http = require('http');
	var moment = require('moment');
	var async = require('async');
	var schedule = require('node-schedule');
	var pasteall = require("pasteall"); 		// wewt, I wrote that module!
	var exec = require('child_process').exec;
	var GitHubApi = require("github");

	var github = new GitHubApi({
		// required
		version: "3.0.0",
	});
	
	// OAuth2 Key/Secret
	github.authenticate({
		type: "basic",
		username: opts.gituser,
		password: opts.gitpassword
	});


	/*

		pasteall.paste("function(foo,bar,quux){\n  console.log('foothousandthree');\n}","javascript",function(err,url){
			if (!err) {
				console.log("resulting url of paste:",url);
			} else {
				console.log("pasteall errored: ",err);
			}
		});

		exec("ls -la", function(error, stdout, stderr) {
			console.log(stdout);
		});
	*/

	var job_in_progress = false;

	// Our properties
	this.last_modified = new moment();	// When was the file on server last updated?

	this.ircHandler = function(text,from,message) {

		// Let's parse the command.
		console.log("text",text);
		console.log("from",from);
		console.log("from",message);

		// Let's check if they're authorized.
		var authorized = false;
		if (message.nick == opts.irc_authuser && message.host == opts.irc_authhost) {
			authorized = true;
		}

		bot.parse(text,function(cmd){
			// "!foo bar quux" returns: 
			// { command: "foo", args: ["bar","quux"]}
			if (cmd) {
				switch (cmd.command) {
					case "foo":
						this.logit("W00t, foo command");
						break;
					case "help":
						this.logit("I know these commands: !build (force a build) !foo (just a test function)");
						break;
					case "build":
						if (authorized) {
							this.logit("No prob, I'm kicking off an update for you.");
							this.performUpdate();
						} else {
							this.logit("You're not my master, ask " + opts.irc_authuser + " to do this");
						}
						break;
					default:
						this.logit("Sorry, I don't know the command !" + cmd.command);
						break;
				}
			}
		}.bind(this));

	}.bind(this);

	// Our virtual constructor.
	this.instantiate = function() {

		// For an update if we've asked for one.
		if (opts.forceupdate) {
			this.last_modified = new moment().subtract(20, "years");
			this.logit("Forcing an update on start, set date to: ",this.last_modified.toDate());
		} 

		// Check for update once, then, once it's updated, schedule the job to recur.
		this.checkForUpdate(function(initialupdate){

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

		if (!job_in_progress) {

			// Set that we have a running job.
			job_in_progress = true;

			// Ok, let's handle a new build.
			// Steps:
			// update the git repo
			// pull the dockers
			// build the docker image
			// push the docker image
			this.logit("We're starting to perform an update");

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
				// We're done with this running job.
				job_in_progress = false;
				if (!err) {
					this.logit("Looking good -- appears we have a successful build!");
				} else {
					this.logit("ERROR: Failed to performUpdate -- ",err);
				}
			}.bind(this));

		} else {
			// There's nothing to do, usually.

		}

	}

	this.gitCloneAndUpdate = function(buildstamp,callback) {

		// Ok, let's clone the repo, and update it.
		branch_name = "autobuild-" + buildstamp;
		
		async.series({
			// Remove the tempdir if necessary
			rmdir: function(callback){
				exec("rm -Rf " + CLONE_PATH,function(err){
					callback(err);
				});
			}.bind(this),

			// Clone with git.
			clone: function(callback){
				// this.logit("Beginning git clone.");
				var cmd_gitclone = 'git clone https://' + opts.gituser + ':' + opts.gitpassword + '@github.com/' + opts.gitrepo + ".git " + CLONE_PATH;
				// console.log("!trace cmd_gitclone: ",cmd_gitclone);
				exec(cmd_gitclone,function(err,stdout,stderr){
					callback(err,stdout);
				});
			}.bind(this),

			// 1. Branch from master
			branch: function(callback){
				exec('git checkout -b ' + branch_name, {cwd: CLONE_PATH}, function(err,stdout){
					// console.log("!trace branch stdout: ",stdout);
					callback(err,stdout);
				});
			},

			branch_verbose: function(callback){
				exec('git branch -v', {cwd: CLONE_PATH}, function(err,stdout){
					// console.log("!trace branch -v stdout: \n",stdout);
					callback(err,stdout);
				});
			},

			branch_verbose: function(callback){
				exec('sed -i -e "s|AUTOBUILD_UNIXTIME [0-9]*|AUTOBUILD_UNIXTIME ' + buildstamp + '|" Dockerfile', {cwd: CLONE_PATH}, function(err,stdout){
					callback(err,stdout);
				});
			},

			git_add: function(callback){
				exec('git add Dockerfile', {cwd: CLONE_PATH}, function(err,stdout){ callback(err,stdout); });
			},

			git_commit: function(callback){
				exec('git commit -m "[autobuild] Updating, new tarball found @ ' + buildstamp + '"', {cwd: CLONE_PATH}, function(err,stdout){ callback(err,stdout); });
			},

			git_push: function(callback){
				exec('git push origin ' + branch_name, {cwd: CLONE_PATH}, function(err,stdout){ callback(err,stdout); });
			},

			pull_request: function(callback) {

				var repo_username = opts.gitrepo.replace(/^(.+)\/.+$/,"$1");
				var repo_name = opts.gitrepo.replace(/^.+\/(.+)$/,"$1");
				// console.log("!trace PLAIN REPO: |" + repo_name + "|");

				github.pullRequests.create({
					user: repo_username,
					repo: repo_name,
					title: "[autobuild] Updating Asterisk @ " + buildstamp,
					body: "Your friendly builder bot here saying that we're updating @ " + buildstamp,
					base: BRANCH_MASTER,
					head: branch_name,
				},function(err,result){
					// console.log("!trace PULL REQUEST err/result: ",err,result.url);
					callback(err,result);
				});

			}

			// Alright, that's great, all we need to do is simply.
			
			// 2. Edit the file.
			// 3. Stage changes.
			// 4. commit
			// 5. Push.

		},function(err,result){
			if (!err) {

				// console.log("!trace gitCloneAndUpdate RESULTS");
				// console.log(JSON.stringify(result, null, 2));

				this.logit("Repo cloned & updated, pull request @ " + result.pull_request.html_url);
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

	this.logit = function(message) {
		console.log("[log message] " + message);
		bot.say(message);
	}

	this.instantiate();

}