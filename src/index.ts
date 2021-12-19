import { SupportLanguage, Parser, Printer } from 'prettier'
import { Tree } from 'tree-sitter'
import { parser } from './parser'
import { printAwk } from './printer'

type ParserName = string
type PrinterName = string

export const languages: SupportLanguage[] = [
  {
    name: 'AWK',
    extensions: ['.awk', '.gawk'],
    parsers: ['awk-parse'],
  },
]

export const parsers: Record<ParserName, Parser> = {
  'awk-parse': {
    parse: (text: string): Tree => parser.parse(text),
    astFormat: 'awk-format',
    locStart: () => 0,
    locEnd: () => 0,
  },
}

export const printers: Record<PrinterName, Printer> = {
  'awk-format': {
    print: printAwk,
  },
}
