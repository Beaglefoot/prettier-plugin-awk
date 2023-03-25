import * as Parser from 'tree-sitter'
// @ts-ignore
import * as AWK from 'tree-sitter-awk.abi13'

export const parser = new Parser()

parser.setLanguage(AWK)
