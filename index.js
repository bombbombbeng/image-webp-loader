
const loaderUtils = require('loader-utils')
const validateOptions = require('schema-utils').validate
const CWebp = require('cwebp').CWebp
const path = require('path')
const os = require('os')
CWebp.bin = os.type() === 'Darwin'
  ? path.join(__dirname,'./libwebp/libwebp-0.4.1-mac-10.8/cwebp')
  : path.join(__dirname,'./libwebp/libwebp-1.1.0-windows-x64/cwebp')

const webpSchema = {
  type: 'object',
  properties: {
    quality: {
      type: 'number'
    },
    minLength: {
      type: 'number'
    }
  }
}

module.exports = function(source) {
  const options = loaderUtils.getOptions(this)
  const loader = this
  const parsed = path.parse(this.resourcePath);
  validateOptions(webpSchema, options, 'webp-loader')
  const { quality = 75, minLength } = options
  let callback = this.async()

  if(!minLength || source.length > minLength ) {
    let encoder = new CWebp(source)
    encoder.quality(quality)
    encoder.toBuffer()
      .then(function(buffer) {
        loader.resourcePath = loader.resourcePath.replace(parsed.ext, '.webp')
        callback(null, buffer)
      })
      .catch(function(err) {
        callback(err)
      })
  } else {
    callback(null, source)
  }

}

module.exports.raw = true