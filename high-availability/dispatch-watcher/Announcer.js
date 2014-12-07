module.exports = function(log,opts) {

	console.log("!trace announcer init! ...not much more.");

	var async = require('async');
	var moment = require('moment');

	var Etcd = require('node-etcd');
	var etcd = new Etcd(opts.etcdhost, '4001');


}