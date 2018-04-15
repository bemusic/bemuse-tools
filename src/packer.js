
import Promise    from 'bluebird'
import co         from 'co'
import fs         from 'fs'
import _          from 'lodash'

import { join } from 'path'

import AudioConvertor   from './audio'
import Directory        from './directory'
import BemusePacker     from './bemuse-packer'

let mkdirp    = Promise.promisify(require('mkdirp'))
let fileStat  = Promise.promisify(fs.stat, fs)

export function packIntoBemuse(path) {
  return co(function*() {

    let stat = yield fileStat(path)
    if (!stat.isDirectory()) throw new Error('Not a directory: ' + path)

    let directory = new Directory(path)
    let packer    = new BemusePacker(directory)

    console.log('-> Loading audios!')
    let audio     = yield directory.files('**/*.{mp3,wav,ogg,xa}')

    console.log('-> Converting audio to ogg [better audio performance]')
    let oggc      = new AudioConvertor('ogg', '-C', '3')
    oggc.force    = true
    let oggs      = yield dotMap(audio, file => oggc.convert(file))

    console.log('-> Converting audio to m4a [for iOS and Safari]')
    let m4ac      = new AudioConvertor('m4a')
    let m4as      = yield dotMap(audio, file => m4ac.convert(file))

    packer.pack('m4a',  m4as)
    packer.pack('ogg',  oggs)

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








