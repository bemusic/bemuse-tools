import BaseConverter from './base'
import convert from 'xa-dtx'

export class XAConverter extends BaseConverter {
  convert(input, inputFormat) {
    if (inputFormat !== 'xa') {
      return Promise.reject(
        new Error('Trying to convert non-xa format with XA converter')
      )
    }
    return convert(input).then(wav => Promise.resolve(wav.buffer))
  }
}

export default XAConverter
