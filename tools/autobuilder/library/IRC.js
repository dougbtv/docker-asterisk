module.exports = function(opts) {

	// We use an IRC bot on freenode for our interface to this guy.
	var irc = require("irc");
	this.bot = new irc.Client(opts.irc_server, opts.irc_nick, {
		userName: opts.irc_nick,
		realName: opts.irc_realname,
		port: 7000,
		// debug: opts.irc_debug,
		debug: true,
		showErrors: true,
		autoRejoin: true,
		autoConnect: false,
		channels: [opts.irc_channel],
		secure: true,
		selfSigned: true,
		certExpired: true,
		floodProtection: false,
		floodProtectionDelay: 1000,
		stripColors: true,
		channelPrefixes: "&#",
		messageSplit: 512
	});

	// Let him connect to the IRC server.
	if (!opts.irc_disabled) {
		this.bot.connect(function() {
			// Ok we're connected.
			console.log("Cool, we connected");
			// Identify if need be.
			/* if (privates.IRC_DO_IDENTIFY) {
				this.bot.say("nickserv", "identify " + privates.IRC_IDENTPASS);
			} */
		});
	} else {
		console.log("WARNING: IRC disabled (usually this is for debugging)");
	}

	// Give a way to say something.
	this.say = function(message) {
		this.bot.say(opts.irc_channel, message);
	}


};