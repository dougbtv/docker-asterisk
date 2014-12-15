# coreos-bootstrap

In order to effectively run ansible, the target machine needs to have a python interpreter. Coreos machines are minimal and do not ship with any version of python. To get around this limitation we can install [pypy](http://pypy.org/), a lightweight python interpreter. The coreos-bootstrap role will install pypy for us and we will update our inventory file to use the installed python interpreter.

# install

```
ansible-galaxy install defunctzombie.coreos-bootstrap
```

# Configure your project

Unlike a typical role, you need to configure Ansible to use an alternative python interpreter for coreos hosts. This can be done by adding a `coreos` group to your inventory file and setting the group's vars to use the new python interpreter. This way, you can use ansible to manage CoreOS and non-CoreOS hosts. Simply put every host that has CoreOS into the `coreos` inventory group and it will automatically use the specified python interpreter.
```
[coreos]
host-01
host-02

[coreos:vars]
ansible_ssh_user=core
ansible_python_interpreter="PATH=/home/core/bin:$PATH python"
```

This will configure ansible to use the python interpreter at `/home/core/bin/python` which will be created by the coreos-bootstrap role.

## Bootstrap Playbook

Now you can simply add the following to your playbook file and include it in your `site.yml` so that it runs on all hosts in the coreos group.

```yaml
- hosts: coreos
  gather_facts: False
  roles:
    - defunctzombie.coreos-bootstrap
```

Make sure that `gather_facts` is set to false, otherwise ansible will try to first gather system facts using python which is not yet installed!

## Example Playbook

After bootstrap, you can use ansible as usual to manage system services, install python modules (via pip), and run containers. Below is a basic example that starts the `etcd` service, installs the `docker-py` module and then uses the ansible `docker` module to pull and start a basic nginx container.

```yaml
- name: Nginx Example
  hosts: web
  sudo: true
  tasks:
    - name: Start etcd
      service: name=etcd.service state=started

    - name: Install docker-py
      pip: name=docker-py

    - name: pull container
      raw: docker pull nginx:1.7.1

    - name: launch nginx container
      docker:
        image="nginx:1.7.1"
        name="example-nginx"
        ports="8080:80"
        state=running
```

# License
MIT
