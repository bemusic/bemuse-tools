import Promise    from 'bluebird'
import fs         from 'fs'
import { extname, basename } from 'path'
import xaConvert  from 'xa-dtx'
import ffmpeg     from 'fluent-ffmpeg'
import {ReadableBufferStream, WritableBufferStream} from './bufferstream'

export class AudioConvertor {
  constructor(type, ...extra) {
    this._target = type
    this._extra = extra
  }

  convert(file) {
    let ext = extname(file.name)
    let name = basename(file.name, ext) + '.' + this._target
    ext = ext.toLowerCase().substr(1)

    if (ext === this._target && !this.force) {
      return Promise.resolve(file)
    } else if (ext === 'xa') {
      return xaConvert(file.path).then(wav => {
        return this._doFfmpeg(wav.buffer, 'wav', this._target, name)
      }).then(buffer => file.derive(name, buffer))
    } else {
      return this
        ._doFfmpeg(file.path, ext, this._target, name)
        .then(buffer => file.derive(name, buffer))
    }
  }

  _doFfmpeg(input) {
    return new Promise((resolve, reject) => {
      let readStream

      // init input stream
      if (typeof input === 'string') {
        readStream = fs.createReadStream(input)
      } else {
        readStream = new ReadableBufferStream(input)
      }

      let writeStream = new WritableBufferStream()

      // do ffmpeg
      ffmpeg(readStream)
        .output(writeStream)
        .outputOptions(this._extra)
        .on('end', () => {
          // let outBuffer = writeStream._buffer.slice(0, writeStream._bufferPos)
          resolve(writeStream.buffer)
        })
        .on('error', (err) => {
          console.error('Unable to convert audio file -- ffmpeg exited ' + err)
          reject(new Error('ffmpeg process exited: ' + err))
        })
        .run()
    })
  }
}

export default AudioConvertor
