Hacked together proof of concept that shows resizing a JPEG off the main thread
(web worker) in a browser context.

Run with: `yarn start:dev`

The goals:
 - use webpack to build
 - resize a JPEG off the main thread
 - keep the EXIF/metadata for the resized image
 - have resized image as bytes (Blob/File) for sending over HTTP

TODO
 - try to cull down how much of Jimp we pull in
