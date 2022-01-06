// source: https://github.com/prettier/prettier/blob/ee2839bacbf6a52d004fa2f0373b732f6f191ccc/tests_config/run_spec.js
'use strict'

const fs = require('fs')
const path = require('path')
const prettier = require('prettier')
const assert = require('assert')

function run_spec(dirname, options) {
  describe(path.basename(dirname), () => {
    fs.readdirSync(dirname)
      .filter((filename) => {
        const filepath = dirname + '/' + filename
        return (
          path.extname(filename) !== '.snap' &&
          fs.lstatSync(filepath).isFile() &&
          filename[0] !== '.' &&
          filename !== 'jsfmt.spec.js'
        )
      })
      .forEach((filename) => {
        it(filename, () => {
          const filepath = dirname + '/' + filename

          let rangeStart = 0
          let rangeEnd = Infinity
          let cursorOffset

          const source = read(filepath)
            .replace(/\r\n/g, '\n')
            .replace('<<<PRETTIER_RANGE_START>>>', (match, offset) => {
              rangeStart = offset
              return ''
            })
            .replace('<<<PRETTIER_RANGE_END>>>', (match, offset) => {
              rangeEnd = offset
              return ''
            })

          const input = source.replace('<|>', (match, offset) => {
            cursorOffset = offset
            return ''
          })

          const mergedOptions = Object.assign(mergeDefaultOptions(options || {}), {
            filepath,
            rangeStart,
            rangeEnd,
            cursorOffset,
          })

          const output = prettyprint(input, mergedOptions)
          const snapshot = getSnapshot(dirname, filename)
          const actual = assembleSnapshotFormat(source, output, mergedOptions.printWidth)

          if (!snapshot) {
            writeSnapshot(dirname, filename, actual)
            return
          }

          assert.equal(actual, snapshot)
        })
      })
  })
}

global.run_spec = run_spec

function prettyprint(src, options) {
  const result = prettier.formatWithCursor(src, options)

  if (options.cursorOffset >= 0) {
    result.formatted =
      result.formatted.slice(0, result.cursorOffset) +
      '<|>' +
      result.formatted.slice(result.cursorOffset)
  }

  return result.formatted
}

function read(filename) {
  return fs.readFileSync(filename, 'utf8')
}

function mergeDefaultOptions(parserConfig) {
  return Object.assign(
    {
      plugins: [path.dirname(__dirname)],
      printWidth: 80,
    },
    parserConfig,
  )
}

function getSnapshotPath(dirnameWithTest, filename) {
  return path.join(dirnameWithTest, '__snapshots__', `${filename}.snap`)
}

function getSnapshot(dirnameWithTest, filename) {
  const snapshotPath = getSnapshotPath(dirnameWithTest, filename)

  if (!fs.existsSync(snapshotPath)) return null

  return read(snapshotPath)
}

function writeSnapshot(dirnameWithTest, filename, snapshotText) {
  const snapshotPath = getSnapshotPath(dirnameWithTest, filename)

  if (!fs.existsSync('__snapshots__')) fs.mkdirSync('__snapshots__')

  fs.writeFileSync(snapshotPath, snapshotText)

  console.log(`${path.basename(snapshotPath)} was written`)
}

function assembleSnapshotFormat(source, output, printWidth) {
  return source + '~'.repeat(printWidth) + '\n' + output
}
