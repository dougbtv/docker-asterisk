# dougbtv/kamailio

A Kamailio build that's tailored for using with a high-availability Asterisk setup. See more details about the setup [on github](https://github.com/dougbtv/docker-asterisk)

Primarily, it uses the Kamailio dispatcher functionality to load-balance asterisk services. It also gets spiced up with [kamailio-etcd-dispatcher](https://www.npmjs.com/package/kamailio-etcd-dispatcher) so that it can discover Asterisk boxen as they come online.

## Resources

Based on some of these resources:

* [kamailio dispatcher documentation](http://kamailio.org/docs/modules/4.1.x/modules/dispatcher.html#idp1879032)
* [loadbalancing asterisk w/ kamailio](http://www.kamailio.org/dokuwiki/doku.php/asterisk:load-balancing-and-ha)
* [kamailio logging](http://nil.uniza.sk/sip/kamailio/kamailio-logging-how-debian-lenny)
* [kamailio rtpproxy, currently doesn't proxy rtp](http://kamailio.org/docs/modules/4.1.x/modules/rtpproxy.html)
	
## Some environment variables

Sometimes you'll wanna tweak the memory, so refer to the [troubleshooting kamailio memory tutorial](http://www.kamailio.org/wiki/tutorials/troubleshooting/memory).

For example if you'd usually run kamailio like so:

```bash
kamailio -M 12 -m 128 ...
```

With `-M` we set `pkg` memory, and with `-m` we set `shr` memory. 

We provide a couple of these

* `KAMAILIO_SHR` will set the `shr` memory in megs (here defaults to 64 meg)
* `KAMAILIO_PKG` will set the `pkg` memory in megs (here defaults to 24 meg)

So for example, you can set these when you use `docker run` a la:

```bash
[user@host kamailio]# docker run -dt -e "KAMAILIO_SHR=512" -e "KAMAILIO_PKG=96" dougbtv/kamailio 
```

And you can check these out at run time with:

```bash
[user@host kamailio]# docker exec -it dreamy_fermat /bin/bash
[root@3ec34189db39 /]# kamctl stats shmem
shmem:fragments = 9
shmem:free_size = 534203992
shmem:max_used_size = 2673312
shmem:real_used_size = 2666920
shmem:total_size = 536870912
shmem:used_size = 2442528
[root@3ec34189db39 /]# ps ax
   28 ?        S+     0:00 kamailio -M 96 -m 512 -DD -E -e
   29 ?        S+     0:00 kamailio -M 96 -m 512 -DD -E -e
   30 ?        S+     0:00 kamailio -M 96 -m 512 -DD -E -e
   [...]
[root@3ec34189db39 /]# kamcmd pkg.stats
{
	entry: 0
	pid: 26
	rank: 0
	used: 182960
	free: 100182600
	real_used: 480696
}
[...]
```

## Usage tips

The location of, and reloading and listing the kamailio `dispatcher.list`

```
[user@host log]$ nano /etc/kamailio/dispatcher.list 
[user@host log]$ kamcmd dispatcher.list
[user@host log]$ kamcmd dispatcher.reload
[user@host log]$ kamcmd dispatcher.list
```