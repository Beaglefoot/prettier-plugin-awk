import { SupportLanguage, Parser as PrettierParser, Printer, Options } from 'prettier'
import { Node as TSNode } from 'web-tree-sitter'
import { initParser } from './parser'
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

export const parsers: Record<ParserName, PrettierParser> = {
  'awk-parse': {
    parse: async (text: string): Promise<TSNode> => {
      const parser = await initParser()
      const tree = parser.parse(text)
      if (!tree) throw new Error('Failed to parse AWK document')
      return tree.rootNode
    },
    astFormat: 'awk-format',
    locStart: () => -1,
    locEnd: () => -1,
  },
}

export const printers: Record<PrinterName, Printer<TSNode | null>> = {
  'awk-format': {
    print: withNullNodeHandler(withPreservedEmptyLines(withNodesSeparator(printAwk))),
  },
}

export const defaultOptions: Options = {
  tabWidth: 4,
}
