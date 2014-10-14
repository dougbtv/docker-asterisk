// An autobuilder for building asterisk into a docker image, and pushing it to dockerhub.
// @dougbtv 10/11/2014

// Parse our options with nomnom. We centralize this here.
var Options = require("./library/Options.js");
var options = new Options();

options.parse(function(opts){

	console.log("!trace what's up on the opts??? ",opts);

	// We use an IRC bot on freenode for our interface to this guy.
	var irc = require("irc");
	var bot = new irc.Client(opts.irc_server, opts.irc_nick, {
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
		bot.connect(function() {
			// Ok we're connected.
			console.log("Cool, we connected");
			// Identify if need be.
			/* if (privates.IRC_DO_IDENTIFY) {
				bot.say("nickserv", "identify " + privates.IRC_IDENTPASS);
			} */
		});
	} else {
		console.log("WARNING: IRC disabled (usually this is for debugging)");
	}

	// Add a listener to messages, so he can react.
	bot.addListener("message", function(from, to, text, message) {
		
		console.log("message",message);
		console.log("text",text);
		console.log("from",from);
		console.log("to",to);
		
		// Let's handle this command.
		// commandHandler(text,from);
		
	});

	var IRCbot = require('./library/IRC.js');
	var ircbot = new IRCbot(bot);

	// Now, we get to the meat of our dealings, the Builder.
	var Builder = require("./library/Builder.js"); 
	var builder = new Builder(opts,ircbot);

});


// Just a stub. Tie together more modules here in the future if need be.
