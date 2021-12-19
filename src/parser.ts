import * as Parser from 'tree-sitter'
// @ts-ignore
import * as AWK from 'tree-sitter-awk'

export const parser = new Parser()

parser.setLanguage(AWK)
