if (module.hot) {
  module.hot.accept()
}

const dms2dec = require('dms2dec')
import EXIF from 'exif-js'
import Jimp from 'jimp'

async function runOMT() {
  setStatus('running OFF main thread')
  const piWorker = new Worker('./worker.js', { type: 'module' })
  piWorker.onmessage = event => {
    const resized = event.data
    const theBlob = new Blob([resized], { type: 'image/jpeg' })
    const url = URL.createObjectURL(theBlob)
    document.getElementById('the-output-image').src = url
    setStatus('finished')
    getExifFromBlob(theBlob).then(meta => {
      console.log('Metadata in resized image', meta)
    })
  }
  piWorker.postMessage(123)
  // extractGps(meta)
}

function setStatus(msg) {
  document.getElementById('the-status').innerText = msg
}

async function runMainThread() {
  setStatus('running on main thread')
  const resp = await fetch('./static/blah.jpg')
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
  setStatus('finished')
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

document.getElementById('omt-button').addEventListener('mousedown', runOMT)
document
  .getElementById('mainthread-button')
  .addEventListener('mousedown', runMainThread)

document.getElementById('interact-button').addEventListener('mousedown', () => {
  const el = document.getElementById('interaction-count')
  const oldCount = parseInt(el.innerText)
  console.log(oldCount)
  const newCount = oldCount + 1
  el.innerText = newCount
})
