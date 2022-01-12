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

/** Adds an empty line before and after some statements */
export function withStatementSeparator(
  printFn: Printer<SyntaxNode>['print'],
): Printer<SyntaxNode>['print'] {
  return function (path, options, print) {
    const node = path.getValue()
    const result = printFn(path, options, print)

    if (separatedStatements.has(node.type)) {
      return [
        node.previousNamedSibling && node.previousNamedSibling.type !== 'comment'
          ? hardline
          : '',
        result,
        node.nextNamedSibling && !separatedStatements.has(node.nextNamedSibling.type)
          ? hardline
          : '',
      ]
    }

    return result
  }
}

/**
 * Preserves existing empty lines in original source code.
 * Multiple empty lines get replaced with a single one.
 */
export function withPreservedEmptyLines(
  printFn: Printer<SyntaxNode>['print'],
): Printer<SyntaxNode>['print'] {
  const nodeTypesToExclude = new Set(['rule', 'block', 'func_def'])

  return function (path, options, print) {
    const node = path.getValue()
    const result = printFn(path, options, print)

    if (nodeTypesToExclude.has(node.type)) return result

    if (
      !separatedStatements.has(node.type) &&
      node.previousNamedSibling &&
      !separatedStatements.has(node.previousNamedSibling.type)
    ) {
      const currentLine = node.startPosition.row
      const previousLine = node.previousNamedSibling.endPosition.row

      if (currentLine - previousLine > 1) {
        return [hardline, result]
      }
    }

    return result
  }
}
