import fs            from 'fs'
import Promise       from 'bluebird'
import { execFile }  from 'child_process'
import co            from 'co'
import BaseConverter from './base'
import tmp           from '../temporary'

let readFile  = Promise.promisify(fs.readFile, fs)
let writeFile  = Promise.promisify(fs.readFile, fs)

export class AfconvertConverter extends BaseConverter {
  convert(input, inputFormat, options) {
    if (inputFormat !== 'wav') {
      return Promise.reject(
        new Error('Trying to convert non-wav format with qaac converter')
      )
    }

    return co(function*() {
      let wavPath = tmp()
      let m4aPath = tmp()

      yield writeFile(wavPath, input)
      yield execFile('afconvert', [wavPath, m4aPath, ...options])
      return yield readFile(m4aPath)
    }.bind(this))
  }
}

export default AfconvertConverter
