// An autobuilder for building asterisk into a docker image, and pushing it to dockerhub.
// @dougbtv 10/11/2014

// Parse our options with nomnom. We centralize this here.
var Options = require("./library/Options.js");
var options = new Options();

options.parse(function(opts){

	var IRC = require('./library/IRC.js');
	var irc = new IRC(opts);

	// Now, we get to the meat of our dealings, the Builder.
	var Builder = require("./library/Builder.js"); 
	var builder = new Builder(opts,irc);

	// Connect the irc bot's listener to the builder
	irc.bot.addListener("message", function(from, to, text, message) {
		// Let's handle this command.
		builder.ircHandler(text,from,message);
	});

});


// Just a stub. Tie together more modules here in the future if need be.
