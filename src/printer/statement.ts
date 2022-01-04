import { doc, Printer } from 'prettier'
import { SyntaxNode } from 'tree-sitter'

const { hardline } = doc.builders

// These are separated with newline
export const separatedStatements = new Set([
  'if_statement',
  'while_statement',
  'do_while_statement',
  'for_statement',
  'for_in_statement',
  'switch_statement',
])

export function withStatementSeparator(
  printFn: Printer<SyntaxNode>['print'],
): Printer<SyntaxNode>['print'] {
  return function (path, options, print) {
    const node = path.getValue()
    const result = printFn(path, options, print)

    if (separatedStatements.has(node.type)) {
      return [
        node.previousNamedSibling ? hardline : '',
        result,
        node.nextNamedSibling && !separatedStatements.has(node.nextNamedSibling.type)
          ? hardline
          : '',
      ]
    }

    return result
  }
}
