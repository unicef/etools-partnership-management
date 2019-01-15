#!/bin/bash

# Removing etools components from node_modules will ensure we'll get the latest updates from git repos
echo "Removing etools components installed with npm..."
rm -rf ./node_modules/etools-*

echo "Install/update node packages..."
npm i
