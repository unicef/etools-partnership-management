#!/bin/bash

npm prune && npm install

bower install --allow-root --config.interactive=false

gulp frontendBuild
