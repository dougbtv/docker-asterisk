module.exports = function(opts) {

	// Keep something around to say that we're connected.
	// Before a connection, we can't "say" anything.
	var is_connected = false;

	// We use an IRC bot on freenode for our interface to this guy.
	var irc = require("irc");
	this.bot = new irc.Client(opts.irc_server, opts.irc_nick, {
		userName: opts.irc_nick,
		realName: opts.irc_realname,
		port: 7000,
		// debug: opts.irc_debug,
		debug: opts.irc_debug,
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
			is_connected = true;
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
		if (!opts.irc_disabled && is_connected) {
			this.bot.say(opts.irc_channel, message);
		}
	}

	this.parse = function(message,callback) {
		if (/^!/.test(message)) {
			// That's a command
			// Replace that bang, and split by spaces
			var raw = message.replace(/^\!/,"");
			var pts = raw.split(" ");
			var command = pts.shift();
			callback({
				command: command,
				args: pts,
			});
		} else {
			callback(false);
		}
	}


};