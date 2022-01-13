import { SupportLanguage, Parser, Printer, Options } from 'prettier'
import { SyntaxNode } from 'tree-sitter'
import { parser } from './parser'
import { printAwk } from './printer/printer'
import {
  withNullNodeHandler,
  withPreservedEmptyLines,
  withNodesSeparator,
} from './printer/wrappers'

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
    parse: (text: string): SyntaxNode => parser.parse(text).rootNode,
    astFormat: 'awk-format',
    locStart: () => -1,
    locEnd: () => -1,
  },
}

export const printers: Record<PrinterName, Printer> = {
  'awk-format': {
    print: withNullNodeHandler(withPreservedEmptyLines(withNodesSeparator(printAwk))),
  },
}

export const defaultOptions: Options = {
  tabWidth: 4,
}
