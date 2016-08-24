### eTools Partnership Management Portal (PMP)

Polymer frontend portal for partnership management in the UNICEF eTools application

### Setup Inscructions

1)  Clone the repository

```sh
git clone https://github.com/unicef/etools-partnership-management.git
```

2)  Install `gulp` and `bower` globally if you don't have them already

```sh
npm install -g gulp bower
```

3)  Run the build script

```sh
cd etools-partnership-management
./build.sh
```

This script installs the local `npm` and `bower` dependencies,
and then builds and optimizes a production verion


### Development workflow

#### Serve / watch

```sh
gulp serve
```

This outputs an IP address you can use to locally test and another that can be used on devices connected to your network.
Saving html, css, and js files in the project will automatically reload the browser.

#### Run tests

```sh
gulp test
```

This runs the unit tests defined in the `app/test` directory through [web-component-tester](https://github.com/Polymer/web-component-tester).

To run tests Java 7 or higher is required. To update Java go to http://www.oracle.com/technetwork/java/javase/downloads/index.html and download ***JDK*** and install it.

### Creating new elements

New elements must follow the established structure and include at least a basic test.
Luckily this process can be easily automated with the [Yeoman Polymer Generator.](https://github.com/yeoman/generator-polymer)

```sh
npm install -g generator-polymer
```

And in the base directory of the project:

```sh
yo polymer:el my-new-element
```

When prompted to include an import into `elements.html`, choose not to. Our `elements.html` is called `pmp_elements.html`.
This naming issue messes up yeoman if yes is selected. The import can be done manually afterwards.

It will then prompt to create a test. Choose `TDD` and this will create a basic test for you, and you should see it run when using `gulp test`.

#### Build

If you want to build the production version again, use

```sh
gulp frontendBuild
```

### Building into eTools

Follow these instructions if you want to build the frontend into the main etools project.

1)  Navigate to eTools project base directory

1)  Clone the repository into `pmp_frontend`

```sh
git clone https://github.com/unicef/etools-partnership-management.git pmp_frontend
```

3)  Run the build script

```sh
cd etools-partnership-management
./build.sh
```
