import Jimp from 'jimp'

addEventListener('message', event => {
  console.log(event.data)
  hardWorker().then(postMessage)
})

async function hardWorker() {
  const resp = await fetch('./static/blah.jpg')
  const buffer = await resp.arrayBuffer()
  const image = await Jimp.read(buffer)
  const resized = await image
    .resize(200, Jimp.AUTO)
    .quality(60)
    .greyscale()
    .getBufferAsync(Jimp.MIME_JPEG)
  return resized
}
