#!/bin/bash

# Exit on any failure
set -e

npm init
npm install -D typescript google-closure-compiler
npx typescript --init
