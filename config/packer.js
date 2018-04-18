/**
 * Packer options
 *
 *  converters:
 *    extensions: file extensions which packer should find
 *
 *    pack: list of output formats
 *      format: output format
 *      title: title for console output
 *      force: force reencoding if source and output formats are same
 *
 *    rules:
 *      encoders:
 *       dictionary with encode rules
 *        key: output format
 *        value: encoder rule
 *
 *        encoder:
 *          which encoder to use.
 *          Available encoders: ffmpeg, sox, qac, afconvert
 *
 *        options:
 *          options to pass to the encoder.
 *
 *        inputFormats:
 *          supported input formats. If presented, any unsupported format should be decoded to wav.
 *
 *      decoders:
 *        dictionary with decode rules
 *        key: input format
 *        value: decoder rule
 *
 *          decoder:
 *            which decoder to use
 *            Available decoders: ffmpeg, sox, xa
 *
 *          force:
 *            always decode specified format
 */

module.exports = {
  audio: {
    extensions: ['mp3', 'ogg', 'wav', 'xa'],
    pack: [
      {
        format: 'ogg',
        title: 'better audio performance',
        force: true,
      },
      {
        format: 'm4a',
        title: 'for iOS and Safari',
      },
    ],
    rules: {
      encoders: {
        // encode ogg with sox

        ogg: {
          encoder: 'sox',
          options: [
            '-t', 'ogg',
            '-C', '3',
          ],
        },

        // encode ogg with ffmpeg

        // ogg: {
        //   encoder: 'ffmpeg',
        //   options: [
        //     '-q:a', '6',
        //     '-c:a', 'libvorbis',
        //     '-f', 'ogg',
        //   ],
        // },

        // encode m4a with afconvert

        // m4a: {
        //   inputFormats: ['wav'],
        //   encoder: 'afconvert',
        //   options: [
        //     '-f', 'm4af',
        //     '-b', '128000',
        //     '-q', '127',
        //     '-s', '2',
        //   ],
        // },

        // encode m4a with qaac

        m4a: {
          inputFormats: ['wav'],
          encoder: 'qaac',
          options: ['-c', '128'],
        },

        // encode m4a with ffmpeg

        // m4a: {
        //   encoder: 'ffmpeg',
        //   options: [
        //     '-b:a', '192k',
        //     '-c:a', 'aac',
        //     '-movflags', 'frag_keyframe+empty_moov',
        //     '-f', 'ipod',
        //     '-vn',
        //   ],
        // },
      },
      decoders: {
        // decode ogg with sox

        ogg: {
          decoder: 'sox',
          options: [
            '-t', 'wav',
          ],
        },

        // decode ogg with ffmpeg

        // ogg: {
        //   decoder: 'ffmpeg',
        //   options: ['-f', 'wav'],
        // },

        // decode mp3 with sox

        mp3: {
          decoder: 'sox',
          options: [
            '-t', 'wav',
          ],
        },

        // decode mp3 with ffmpeg

        // mp3: {
        //   decoder: 'ffmpeg',
        //   options: ['-f', 'wav'],
        // },

        // decode xa with xa

        xa: {
          decoder: 'xa',
          force: true,
        },
      },
    },
  }
}
