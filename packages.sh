#!/bin/bash

## Download dependencies

BASE=$(pwd)
mkdir "$BASE/packages"
cd "$BASE/packages"
git clone git://github.com/powmedia/backbone-forms.git

mkdir "$BASE/packages/backbone"
cd "$BASE/packages/backbone"
wget 'http://backbonejs.org/backbone.js'
wget 'http://documentcloud.github.com/underscore/underscore.js'
wget 'https://github.com/douglascrockford/JSON-js/raw/master/json2.js'
wget 'https://raw.github.com/marionettejs/backbone.marionette/master/lib/backbone.marionette.js'