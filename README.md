Hacked together proof of concept that shows resizing a JPEG off the main thread
(web worker) in a browser context.

Run with: `yarn start:dev`

TODO
 - remove unused deps
 - try to cull down how much of Jimp we pull in
 - inject metadata back into the resized image
