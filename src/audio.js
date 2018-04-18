import co from 'co'
import { extname, basename } from 'path'
import { cpus } from 'os'
import createConverter from './converters'
import Throat from 'throat'

let throat = new Throat(cpus().length || 1)

export class AudioConvertor {
  constructor(options, rules) {
    this._target = options.format
    this._force = options.force
    this._rules = rules
  }

  convert(file) {
    return co(function*() {
      let ext = extname(file.name)
      let name = basename(file.name, ext) + '.' + this._target
      let inputFormat = yield this.guessFormat(file)

      // return original file if format did not changed and encoding not forced
      if (inputFormat === this._target && !this._force) {
        return yield file.derive(name)
      }

      // get encode rule for target format
      let encodeRule = this._rules.encoders[this._target]
      if (!encodeRule) {
        return Promise.reject(new Error('Encode rule not found'))
      }

      // get decodeRule for source format
      let decodeRule = this._rules.decoders[inputFormat] ||
        this._rules.decoders.default

      let buffer
      // decode if encoder does not support source format or source should be force decoded
      if (decodeRule.force ||
        encodeRule.inputFormats &&
        encodeRule.inputFormats.indexOf(inputFormat) === -1) {
        buffer = yield this.decode(file.buffer, inputFormat, decodeRule)
        inputFormat = 'wav'
      } else {
        buffer = file.buffer
      }

      // encode buffer to target format
      buffer = yield this.encode(buffer, inputFormat, encodeRule)

      return yield Promise.resolve(file.derive(name, buffer))
    }.bind(this))
  }

  guessFormat(file) {
    return new Promise((resolve, reject) => {
      let buffer = file.buffer

      if (buffer.length < 4) {
        return reject(new Error('Empty keysound file'))
      }

      if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
        resolve('mp3')
      } else if (buffer[0] === 0xFF && buffer[1] === 0xFB) {
        resolve('mp3')
      } else if (buffer[0] === 0x4F && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) {
        resolve('ogg')
      } else {
        let ext = extname(file.name).substr(1).toLowerCase()
        resolve(ext)
      }
    })
  }

  decode(buffer, inputFormat, rule) {
    let decoder = createConverter(rule.decoder, rule.options)
    if (!decoder) {
      return Promise.reject(new Error(`Decoder ${rule.decoder} not found`))
    }

    return throat(() => decoder.convert(buffer, inputFormat, rule.options))
  }

  encode(buffer, inputFormat, rule) {
    let encoder = createConverter(rule.encoder, rule.options)
    if (!encoder) {
      return Promise.reject(new Error(`Encoder ${rule.decoder} not found`))
    }

    return throat(() => encoder.convert(buffer, inputFormat, rule.options))
  }
}

export default AudioConvertor
