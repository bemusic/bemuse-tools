import fs            from 'fs'
import Promise       from "bluebird"
import { spawn }     from 'child_process'
import BaseConverter from './base'
import tmp           from '../temporary'

let readFile  = Promise.promisify(fs.readFile, fs)

export class QaacConverter extends BaseConverter {
  convert(input, inputFormat, options) {
    if (inputFormat !== 'wav') {
      return Promise.reject(
        new Error('Trying to convert non-wav format with qaac converter')
      )
    }

    return new Promise((resolve, reject) => {
      let tmpFile = tmp()

      let qaac = spawn('vendor/bin/qaac', ['-o', tmpFile, ...options, '-'])
      qaac.stdin.write(input)
      qaac.stdin.end()
      qaac.on('close', (code) => {
        if (code === 0) {
          readFile(tmpFile).then(buffer => {
            resolve(buffer)
            fs.writeFileSync('tmp.m4a', buffer)
          })
        } else {
          reject(new Error('SoX process exited: ' + code))
        }
      })
    })

  }
}

export default QaacConverter
