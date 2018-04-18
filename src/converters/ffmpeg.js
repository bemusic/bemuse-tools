import ffmpeg     from 'fluent-ffmpeg'
import BaseConverter from './base'
import {ReadableBufferStream, WritableBufferStream} from '../bufferstream'

export class FFMpegConverter extends BaseConverter {
  convert(input) {
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
        .outputOptions(this._options)
        .on('end', () => {
          resolve(writeStream.buffer)
        })
        .on('error', (err) => {
          reject(new Error('ffmpeg process exited: ' + err))
        })
        .run()
    })
  }
}

export default FFMpegConverter
