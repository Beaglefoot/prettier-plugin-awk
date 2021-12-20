// This file is for debugging convenience only
import * as prettier from 'prettier'
import * as plugin from '.'
import { readFileSync } from 'fs'

const AWK_SOURCE_PATH = process.env.AWK_SOURCE_PATH

if (!AWK_SOURCE_PATH)
  throw new Error('Initialize AWK_SOURCE_PATH env variable and try again')

const text = readFileSync(AWK_SOURCE_PATH, 'utf8')

const result = prettier.format(text, {
  plugins: [plugin],
  parser: 'awk-parse',
})

console.log(result)
