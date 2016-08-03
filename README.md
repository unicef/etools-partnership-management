eTools Partnership Management Portal
====================================

Installation
------------

Using git, clone to a local directory:

```bash
$ git clone https://github.com/unicef/etools-partnership-management
```

Install required development Node and Bower packages:

```bash
$ npm install
```

Install Bower for building components:

```bash
$ npm install -g bower
```

Install Bower components:

```bash
$ bower install
```

Build Application
-----------------

To build the distribution version:

```bash
$ gulp default
```

Run Application
---------------

To run the development version, open it in a browser and update upon any change to the files:

```bash
$ gulp serve
```

To run a production version:

```bash
$ gulp serve:dist
```
