
import Promise    from 'bluebird'
import co         from 'co'
import fs         from 'fs'
import _          from 'lodash'

import { join } from 'path'

import AudioConvertor   from './audio'
import Directory        from './directory'
import BemusePacker     from './bemuse-packer'

import config   from '../config/packer'

let mkdirp    = Promise.promisify(require('mkdirp'))
let fileStat  = Promise.promisify(fs.stat, fs)

export function packIntoBemuse(path) {
  return co(function*() {

    let stat = yield fileStat(path)
    if (!stat.isDirectory()) throw new Error('Not a directory: ' + path)

    let directory = new Directory(path)
    let packer    = new BemusePacker(directory)

    console.log('-> Loading audios')
    let extensions = config.audio.extensions.join(',')
    let audio     = yield directory.files('**/*.{' + extensions + '}')

    for (let i in config.audio.pack) {
      let options = config.audio.pack[i]
      console.log(`-> Converting audio to ${options.format} [${options.title}]`)
      let converter = new AudioConvertor(options, config.audio.rules)
      let audios    = yield dotMap(audio, file => converter.convert(file))
      packer.pack(options.format, audios)
    }

    console.log('-> Writing...')
    let out = join(path, 'assets')
    yield mkdirp(out)
    yield packer.write(out)
  })
}

function dotMap(array, map) {
  return (
    Promise.map(
      array,
      item => (Promise.resolve(map(item))
        .tap(() => process.stdout.write('.'))
        .then(result => [result])
        .catch(e => {
          process.stdout.write('x')
          process.stderr.write('[ERR] ' + e.stack)
          return [ ]
        })
      )
    )
    .then(results => _.flatten(results))
    .tap(() => process.stdout.write('\n'))
  )
}








