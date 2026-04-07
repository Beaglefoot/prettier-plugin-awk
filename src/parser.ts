import { Parser, Language, Node as TSNode } from 'web-tree-sitter'

let _parser: Parser | null = null

export async function initParser(): Promise<Parser> {
  if (_parser) return _parser

  // web-tree-sitter exports its WASM runtime directly — no locateFile needed
  await Parser.init({
    locateFile: () => require.resolve('web-tree-sitter/web-tree-sitter.wasm'),
  })

  const awkWasmPath = require.resolve('tree-sitter-awk/tree-sitter-awk.wasm')
  const AWK = await Language.load(awkWasmPath)

  _parser = new Parser()
  _parser.setLanguage(AWK)
  return _parser
}

export type { TSNode }
