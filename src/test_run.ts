// This file is for debugging convenience only
import * as prettier from 'prettier'
import * as plugin from '.'
import { readFileSync } from 'fs'
import { stdout } from 'process'
import { basename } from 'path'

function usage(): void {
  stdout.write('\nUsage:\n\n')
  stdout.write(`    node ${basename(__filename)} FILEPATH.awk\n\n`)
}

if (process.argv.length !== 3) {
  usage()
  process.exit(2)
}

const filepath = process.argv[2]

const text = readFileSync(filepath, 'utf8')

const result = prettier.format(text, {
  plugins: [plugin],
  parser: 'awk-parse',
})

console.log(result)
