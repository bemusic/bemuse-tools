import FFMpegConverter from './ffmpeg'
import XAConverter from './xa'
import SoXConverter from './sox'
import QaacConverter from './qaac'
import AfconvertConverter from './afconvert'

export function createConverter(format, options) {
  return new Converters[format](options)
}

let Converters = {
  ffmpeg: FFMpegConverter,
  xa: XAConverter,
  sox: SoXConverter,
  qaac: QaacConverter,
  afconvert: AfconvertConverter,
}

export default createConverter
