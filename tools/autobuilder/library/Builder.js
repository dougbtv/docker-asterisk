module.exports = function(opts,bot) {

	// Constants.
	var ASTERISK_HOST = "downloads.asterisk.org";
	var ASTERISK_URL = "/pub/telephony/certified-asterisk/certified-asterisk-11.6-current.tar.gz";
	var CLONE_PATH = "/tmp/docker-asterisk/";
	var BRANCH_NAME = "autobuild";
	var BRANCH_MASTER = "master";
	var LOG_DOCKER = "/tmp/autobuild.docker.log";

	// Our requirements.
	var fs = require('fs');
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

	var job_in_progress = false;

	// Break up the repo options, for normalization in calling the github module.
	var repo_username = opts.gitrepo.replace(/^(.+)\/.+$/,"$1");
	var repo_name = opts.gitrepo.replace(/^.+\/(.+)$/,"$1");
				

	// Our properties
	this.last_modified = new moment();	// When was the file on server last updated?
	this.last_pullrequest = 0;

	this.ircHandler = function(text,from,message) {

		// Let's parse the command.
		// console.log("text",text);
		// console.log("from",from);
		// console.log("from",message);

		// Let's check if they're authorized.
		var authorized = false;

		// Sometimes, in dev you don't care about auth.
		if (opts.authdisabled) {
			authorized = true;
		}
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
						this.logit("I know these commands: !build !lastcmd !tail");
						break;
					case "lastcmd":
						this.lastCommandLog(function(last){
							this.logit("Last command: " + last);
						}.bind(this));
						break;
					case "tail":
						this.tailCommandLog(function(last){
							this.logit("Log tail: " + last);
						}.bind(this));
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
			// rule.hour = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
			rule.minute = 0;
			

			var j = schedule.scheduleJob(rule, function(){

				this.logit("Checking for an update @ " + moment().format("YYYY-MM-DD HH:mm:ss"));

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

			async.series({
				clone_and_update: function(callback){
					// Let's update our git repository.
					this.gitCloneAndUpdate(buildstamp,function(err){
						callback(err);
					});
				
				}.bind(this),

				do_docker_build: function(callback){

					if (!opts.skipbuild) {
						// Ok, now, we can perform the docker build.
						this.dockerBuild(function(err){
							callback(err);	
						});
					} else {
						this.logit("We skipped the build, by a debug flag.");
						callback(null);
					}
					
					
				}.bind(this)

			},function(err,result){
				// We're done with this running job.
				job_in_progress = false;
				if (!err) {
					this.logit("Looking good -- appears we have a successful build!");
				} else {
					this.logit("ERROR: Failed to performUpdate -- " + err);
				}
			}.bind(this));

		} else {
			// There's nothing to do, usually.

		}

	}

	var execlog = function(cmd,callback){
		exec('echo "=>======== ' + cmd + ' (@ ' + moment().format("YYYY-MM-DD HH:mm:ss") + ')" >> ' + LOG_DOCKER,function(){
			exec(cmd + ' >> ' + LOG_DOCKER + ' 2>&1 ',function(err,stdout,stderr){
				callback(err,stdout,stderr);
			});
		});
	}

	this.lastCommandLog = function(callback) {

		exec('cat ' + LOG_DOCKER + ' | grep \'=>========\' | tail -n 1',function(err,stdout,stderr){
			callback(stdout);
		});

	}

	this.tailCommandLog = function(callback) {

		exec('tail -n 3 ' + LOG_DOCKER,function(err,stdout,stderr){
			callback(stdout);
		});

	}


	this.dockerBuild = function(callback) {

		async.series({
			clear_log: function(callback) {
				exec('> ' + LOG_DOCKER,function(err){
					callback(err);
				});
			},

			docker_login: function(callback) {
				// Uhhh, you don't wanna log this.
				var cmd_login = 'docker login --email=\"' + opts.docker_email + '\"' +
					' --username=\"' + opts.docker_user + '\"' +
					' --password=\'' + opts.docker_password + '\' ';
				exec(cmd_login,
					function(err,stdout,stderr){
						// this.logit();
						callback(err,{stdout: stdout, stderr: stderr});
					});
			}.bind(this),

			docker_pull: function(callback) {
				this.logit("Beginning docker pull");
				execlog('docker pull ' + opts.docker_image,function(err,stdout,stderr){
					callback(err,{stdout: stdout, stderr: stderr});
				});
			}.bind(this),

			docker_build: function(callback) {
				this.logit("And we begin the docker build");
				execlog('docker build -t ' + opts.docker_image + ' ' + CLONE_PATH,function(err,stdout,stderr){
					callback(err,{stdout: stdout, stderr: stderr});
				});
				
			}.bind(this),

			docker_show_images: function(callback) {
				execlog('docker images',function(err,stdout,stderr){
					callback(err,{stdout: stdout, stderr: stderr});
				});
			}.bind(this),

			docker_kill: function(callback) {
				execlog('docker kill $(docker ps -a -q) || true',function(err,stdout,stderr){
					callback(err,{stdout: stdout, stderr: stderr});
				});
			}.bind(this),

			docker_clean: function(callback) {
				execlog('docker rm $(docker ps -a -q) || true',function(err,stdout,stderr){
					callback(err,{stdout: stdout, stderr: stderr});
				});
			}.bind(this),

			docker_remove_untagged: function(callback) {
				execlog('docker images | grep -i "none" | awk \'{print \$3}\' | xargs docker rmi || true',function(err,stdout,stderr){
					callback(err,{stdout: stdout, stderr: stderr});
				});
			}.bind(this),
			
			docker_push: function(callback) {
				this.logit("And we've started pushing it");
				execlog('docker push ' + opts.docker_image,function(err,stdout,stderr){
					callback(err,{stdout: stdout, stderr: stderr});
				});
			}.bind(this),

			
		},function(err,results){

			if (!err) { 
				this.logit("Grreeeat! Docker build & push successful");
			} else {
				this.logit("Docker build failed with: " + err);
			}

			// Let's read the log file, and post to pasteall
			fs.readFile(LOG_DOCKER, 'utf8', function (readlogerr, logcontents) {
				if (readlogerr) throw readlogerr;

				pasteall.paste(logcontents,"text",function(err,url){
					if (!err) {
						this.logit("Build results posted @ " + url);

						// last_pullrequest
						if (!opts.skipclone) {
							github.issues.createComment({
								user: repo_username,
								repo: repo_name,
								body: "Build complete, log posted @ " + url,
								number: this.last_pullrequest,
							},function(err,result){
								if (err) {
									console.log("Oooops, somehow the github issue comment failed: " + err);
								}
								// console.log("!trace PULL REQUEST err/result: ",err,result);
								// callback(err,result);
							}.bind(this));
						} else {
							// callback(null);					
						}

					} else {
						this.logit("pasteall errored: " + err);
					}
				}.bind(this));

			}.bind(this));
			
			// console.log("!trace results: %j",results);

			// Let's collect the output, and put it on a paste bin.
			/* 
			var output = "";
			for (var key in results) {
				if (results.hasOwnProperty(key)) {
					output += "====================== " + key + "\n\n";
					output += "-- stdout\n";
					output += results[key].stdout + "\n\n";
					output += "-- stderr\n";
					output += results[key].stderr + "\n\n";
					// console.log(key + " -> " + results[key]);
				}
			}
			console.log("!trace collected output: \n\n",output);
			
			*/

			callback(err);

			
		}.bind(this));
		
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

			// Set your git config user items.
			
   			// 1. Branch from master
			git_set_email: function(callback){
				exec('git config --global user.email "' + opts.git_setemail + '"', function(err,stdout){
					// console.log("!trace branch stdout: ",stdout);
					callback(err,stdout);
				});
			},

			git_set_email: function(callback){
				exec('git config --global user.name "' + opts.git_setname + '"', function(err,stdout){
					// console.log("!trace branch stdout: ",stdout);
					callback(err,stdout);
				});
			},

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
					// Ok, after this point, if we're not updating the clone...
					// We exit with an error.
					if (!opts.skipclone) {
						callback(err,stdout);	
					} else {
						callback("We've skipped updating the clone.");
					}

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

				// console.log("!trace PLAIN REPO: |" + repo_name + "|");

				github.pullRequests.create({
					user: repo_username,
					repo: repo_name,
					title: "[autobuild] Updating Asterisk @ " + buildstamp,
					body: "Your friendly builder bot here saying that we're updating @ " + buildstamp,
					base: BRANCH_MASTER,
					head: branch_name,
				},function(err,result){
					if (!err) {
						// Keep our last pull request.
						this.last_pullrequest = result.number;
					}
					// console.log("!trace PULL REQUEST err/result: ",err,result);
					callback(err,result);
				}.bind(this));

			}.bind(this),

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
		// Let's give a time.
		var displaytime = new moment().format("YYYY-MM-DD HH:mm:ss");
		console.log("[ " + displaytime + " ] " + message);
		bot.say(message);
	}

	this.instantiate();

}