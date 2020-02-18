if (module.hot) {
  module.hot.accept()
}

const JPEGDecoder = require('jpg-stream/decoder')
const er = require('exif-reader')
const dms2dec = require('dms2dec')
import EXIF from 'exif-js'
import Jimp from 'jimp'

async function doit2() {
  console.log('starting resize')
  const resp = await fetch('./static/blah.jpg')
  const imageReadableStream = resp.body
  const buffer = await resp.arrayBuffer()
  const image = await Jimp.read(buffer)
  const resized = await image
    .resize(200, Jimp.AUTO)
    .quality(60)
    .greyscale()
    .getBufferAsync(Jimp.MIME_JPEG)
  const theBlob = new Blob([resized], { type: 'image/jpeg' })
  const url = URL.createObjectURL(theBlob)
  document.getElementById('the-output-image').src = url
  console.log('finished resize')
  const meta = await getExifFromBlob(theBlob)
  console.log('Metadata in resized image', meta)
  // extractGps(meta)
}

export function getExifFromBlob(blobish) {
  return new Promise((resolve, reject) => {
    EXIF.getData(blobish, function() {
      try {
        return resolve(EXIF.getAllTags(this))
      } catch (err) {
        return reject(err)
      }
    })
  })
}

function extractGps(parsedExif) {
  console.log(parsedExif.gps)
  const [latDec, lonDec] = dms2dec(
    parsedExif.gps.GPSLatitude,
    parsedExif.gps.GPSLatitudeRef,
    parsedExif.gps.GPSLongitude,
    parsedExif.gps.GPSLongitudeRef,
  )
  console.log(`lat=${latDec}, lng=${lonDec}`)
}

document.getElementById('the-button').addEventListener('mousedown', doit2)
