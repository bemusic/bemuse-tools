import stream     from 'stream'

export class ReadableBufferStream extends stream.PassThrough {
  constructor(buffer) {
    super()

    this.pause()
    this.end(buffer)
  }
}

export class WritableBufferStream extends stream.Writable {
  constructor() {
    super()

    this._buffer = Buffer.alloc(1024 * 64)
    this._bufferPos = 0
  }

  _write(chunk, encoding, callback) {
    let size = chunk.length

    let newBufferSize = this._buffer.length
    while (size + this._bufferPos > newBufferSize) {
      newBufferSize *= 2
    }
    if (newBufferSize > this._buffer.length) {
      let newBuffer = Buffer.alloc(newBufferSize)
      this._buffer.copy(newBuffer, 0, 0, this._buffer.length)
      this._buffer = newBuffer
    }

    chunk.copy(this._buffer, this._bufferPos, 0)
    this._bufferPos += size

    callback()
  }

  get buffer() {
    return this._buffer.slice(0, this._bufferPos)
  }
}
