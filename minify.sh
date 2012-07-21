#!/bin/sh

rm -rf build
mkdir -p build/img

echo "Building JavaScript..."
cat \
    js/lib/underscore-min.js \
    js/lib/bootstrap.min.js \
    js/lib/jquery.scroll.js \
    js/lib/mediaelement-and-player.min.js \
    js/cs50.video.js \
    js/cs50.video.render.js \
    > build/cs50.video.min.js
java -jar yuicompressor-2.4.7.jar -o build/cs50.video.min.js build/cs50.video.min.js

echo "Building CSS..."
cat \
    css/lib/bootstrap.min.css \
    css/lib/mediaelementplayer.min.css \
    css/lib/mejs-skins.css \
    css/cs50.video.css \
    > build/cs50.video.min.css
java -jar yuicompressor-2.4.7.jar -o build/cs50.video.min.css build/cs50.video.min.css

echo "Copying assets..."
cp js/lib/flashmediaelement.swf js/lib/silverlightmediaelement.xap build
cp css/lib/img/* build/img
