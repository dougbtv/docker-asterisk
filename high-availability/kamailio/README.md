# dougbtv/kamailio

A Kamailio build that's tailored for using with a high-availability Asterisk setup. See more details about the setup [on github](https://github.com/dougbtv/docker-asterisk)

Primarily, it uses the Kamailio dispatcher functionality to load-balance asterisk services. It also gets spiced up with [kamailio-etcd-dispatcher](https://www.npmjs.com/package/kamailio-etcd-dispatcher) so that it can discover Asterisk boxen as they come online.

## Resources

Based on some of these resources:

* (kamailio dispatcher documentation)[http://kamailio.org/docs/modules/4.1.x/modules/dispatcher.html#idp1879032]
* (loadbalancing asterisk w/ kamailio)[http://www.kamailio.org/dokuwiki/doku.php/asterisk:load-balancing-and-ha]
* (kamailio logging)[http://nil.uniza.sk/sip/kamailio/kamailio-logging-how-debian-lenny]
* (kamailio rtpproxy, currently doesn't proxy rtp)[http://kamailio.org/docs/modules/4.1.x/modules/rtpproxy.html]
	

## Usage tips

The location of, and reloading and listing the kamailio `dispatcher.list`

```
[user@host log]$ nano /etc/kamailio/dispatcher.list 
[user@host log]$ kamcmd dispatcher.list
[user@host log]$ kamcmd dispatcher.reload
[user@host log]$ kamcmd dispatcher.list
```