#!/bin/bash

echo "Removing node_modules..."
rm -rf ./node_modules

echo "Removing bower_components..."
rm -rf ./bower_components

echo "Reinstall node and bower packages..."
npm install
bower install
