export class BaseConverter {
  constructor(options) {
    this._options = options
  }

  convert(input, inputFormat, options) {
    return new Promise.reject(new Error('Not implemented'))
  }
}

export default BaseConverter
