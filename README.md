eTools Partnership Management
====================================

Installation
------------

Using git, clone to a local directory:

```bash
$ git clone https://github.com/unicef/etools-partnership-management.git
```
Assuming node and npm are already installed, make sure bower is also installed, if not run:

```bash
$ npm install -g bower
```
Also install polymer-cli:
```bash
$ npm install -g polymer-cli
```

Install packages:
```bash
$ npm install
$ bower install
```

Build Application
-----------------
TODO: Improve this doc section.

To build the distribution version:

```bash
$ polymer build
```

We will be using a bundled build since we don't support
HHTP/2 and server push.

Before the build is created the CSS and images are minified,
Javascript is uglifyed, also there are javascript and html hints.
If any of these tasks fail, the entire build process fails.
So correct your code and try again :)

Run Application
---------------

This application is part of [etools-infra](https://github.com/unicef/etools-infra) 
and runs under a customized setup of etools apps. After `etools-infra` is installed the PMP ap can be accessed 
for devs at `http://localhost:8082/pmp`


