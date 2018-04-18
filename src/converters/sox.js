import { spawn }  from 'child_process'
import BaseConverter from './base'
import endpoint   from 'endpoint'

export class SoXConverter extends BaseConverter {
  convert(input, inputFormat, options) {
    return new Promise((resolve, reject) => {
      let sox = spawn('vendor/bin/sox', ['-t', inputFormat, '-', ...options, '-'])
      sox.stdin.write(input)
      sox.stdin.end()
      sox.stderr.on('data', x => process.stderr.write(x))
      let data = new Promise((resolve, reject) => {
        sox.stdout.pipe(endpoint((err, buffer) => {
          if (err) {
            reject(new Error('Error reading audio!'))
          } else {
            resolve(buffer)
          }
        }))
      })
      sox.on('close', (code) => {
        if (code === 0) {
          resolve(data)
        } else {
          reject(new Error('SoX process exited: ' + code))
        }
      })
    })
  }
}

export default SoXConverter
