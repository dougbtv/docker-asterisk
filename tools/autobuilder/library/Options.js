module.exports = function() {

	var GITHUB_REPO = "dougbtv/docker-asterisk";

	this.parse = function(callback) {

		var opts = require("nomnom")
			.option('gituser', {
				abbr: 'u',
				help: 'Github user',
				required: true
			})
			.option('gitpassword', {
				abbr: 'p',
				help: 'Github password',
				required: true
			})
			.option('docker_user', {
				help: 'Dockerhub user.',
				required: true
			})
			.option('docker_email', {
				help: 'Dockerhub user.',
				required: true
			})
			.option('docker_password', {
				help: 'Dockerhub password',
				required: true
			})
			.option('docker_image', {
				default: "dougbtv/asterisk",
				help: 'The docker image that we update'
			})
			.option('gitrepo', {
				abbr: 'r',
				default: GITHUB_REPO,
				help: 'Github repo url in format: user/project'
			})
			.option('irc_channel', {
				default: "##asterisk-autobuilder",
				help: 'The bots chanel on IRC'
			})
			.option('irc_nick', {
				default: "ast-autobuild",
				help: 'The bots nick on IRC'
			})
			.option('irc_realname', {
				default: "asterisk-autobuilder",
				help: 'The bots "real name" on IRC'
			})
			.option('irc_server', {
				default: "chat.freenode.net",
				help: 'The IRC network to connect to'
			})
			.option('irc_authuser', {
				default: "protocoldoug",
				help: 'The IRC network to connect to'
			})
			.option('irc_authhost', {
				default: "unaffiliated/protocoldoug",
				help: 'The IRC network to connect to'
			})
			.option('irc_debug', {
				flag: true,
				help: 'Show IRC debug output'
			})
			.option('irc_disabled', {
				flag: true,
				help: 'Do not connect to IRC'
			})
			.option('git_setemail', {
				default: "auto@builder.com",
				help: 'The IRC network to connect to'
			})
			.option('git_setname', {
				default: "Your loyal autobuilder",
				help: 'The IRC network to connect to'
			})
			.option('authdisabled', {
				flag: true,
				help: 'Do not authenticate users to use commands'
			})
			.option('skipclone', {
				flag: true,
				help: 'Skip updating the github repo.'
			})
			.option('skipbuild', {
				flag: true,
				help: 'Skip updating the github repo.'
			})
			.option('forceupdate', {
				flag: true,
				help: 'Force an update automatically.'
			})
			.parse();

		callback(opts);


	}.bind(this);	

};