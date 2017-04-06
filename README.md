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

Update app shell from [etools-frontend-template](https://github.com/unicef-polymer/etools-frontend-template/tree/develop)
-------------------------------------------------------------------------------------------------------------------------
Check your local project remote repository for etools-frontend-template:
```bash
$ git remote -v
etools-frontend-template  https://github.com/unicef-polymer/etools-frontend-template.git (fetch)
etools-frontend-template  https://github.com/unicef-polymer/etools-frontend-template.git (push)
origin  https://github.com/unicef/etools-partnership-management.git (fetch)
origin  https://github.com/unicef/etools-partnership-management.git (push)
```

If etools-frontend-template is not listed run:

```bach
$ git remote add etools-frontend-template https://github.com/unicef-polymer/etools-frontend-template.git
```

Update your project frontend app shell:

```bash
$ git checkout develop

$ git fetch etools-frontend-template
From https://github.com/unicef-polymer/etools-frontend-template
 * [new branch]      develop    -> etools-frontend-template/develop

$ git merge --no-ff etools-frontend-template/develop
```

**IMPORTANT!!!** Be careful with frontend app shell template update. It might contain new features you do not have
in your app or you might have made significant changes to fit your app requirements. You may have conflicts at merge.

Build Application
-----------------

To build the distribution version:

```bash
$ gulp
```

We will be using a bundled build since we don't support
HHTP/2 and server push.

Before the build is created the CSS and images are minified,
Javascript is uglifyed, also there are javascript and html hints.
If any of these tasks fail, the entire build process fails.
So correct your code and try again :)

Run Application
---------------

To run the application you can use:

```bash
$ polymer serve
View your app at http://localhost:8080
```
This command will start the server and serve your files directly from app sources.
At this point you do not need to build anything, the files will not be served from build folder.

```bash
$ polymer serve build/bundled
View your app at http://localhost:8080
```
This command will start the server and use the bundled build (build/bundled folder) to serve the files from.
Before you can serve the bundled build you have to generate the build files.
Service worker only works in the built app, so test service worker functionality here.

Check the code
---------------------------------

Run the lint task to check for issues with the code. Please do this before finishing a pull request

```bash
$ gulp lint
```

Additional options for gulp tasks
---------------------------------

Set -l parameter for any gulp task to activate polymer logs during build process

```bash
$ gulp -l
```
