import Jimp from 'jimp'
import piexif from 'piexifjs'

addEventListener('message', event => {
  hardWorker(event.data).then(postMessage)
})

async function hardWorker({ url, maxWidth, quality }) {
  const resp = await fetch(url)
  const buffer = await resp.arrayBuffer()
  const metadata = await getMetadata(buffer)
  // console.log(metadata)
  const image = await Jimp.read(buffer)
  const resized = await image
    .resize(maxWidth, Jimp.AUTO)
    .quality(quality)
    .greyscale()
    .getBufferAsync(Jimp.MIME_JPEG)
  const metadataWidth = metadata.Exif[piexif.ExifIFD.PixelXDimension]
  const metadataHeight = metadata.Exif[piexif.ExifIFD.PixelYDimension]
  const newHeight = Math.round(metadataHeight / (metadataWidth / maxWidth))
  metadata.Exif[piexif.ExifIFD.PixelXDimension] = maxWidth
  metadata.Exif[piexif.ExifIFD.PixelYDimension] = newHeight
  const base64WithMetadata = await writeMetadata(resized, metadata)
  const withoutBase64Prefix = base64WithMetadata.replace(
    'data:image/jpeg;base64,',
    '',
  )
  // thanks for the conversion https://stackoverflow.com/a/16245768/1410035
  const byteCharacters = atob(withoutBase64Prefix)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return byteArray
}

function getMetadata(imageAsArrayBuffer) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function(e) {
      const result = piexif.load(e.target.result)
      return resolve(result)
    }
    const theBlob = new Blob([imageAsArrayBuffer], { type: 'image/jpeg' })
    reader.readAsDataURL(theBlob)
  })
}

function writeMetadata(imageAsArrayBuffer, metadataObj) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function(e) {
      const exifStr = piexif.dump(metadataObj)
      const inserted = piexif.insert(exifStr, e.target.result)
      return resolve(inserted)
    }
    const theBlob = new Blob([imageAsArrayBuffer], { type: 'image/jpeg' })
    reader.readAsDataURL(theBlob)
  })
}
