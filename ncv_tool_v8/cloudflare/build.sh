#!/bin/sh
# Copies the V8 tool and its stylesheet into public/, which Pages serves.
set -e
cd "$(dirname "$0")"
rm -rf public && mkdir public
cp ../../narrative-cv-prototype-v8.html public/index.html
cp ../../styles.css public/styles.css
