import { AstPath, doc, Printer } from 'prettier'
import { Node as TSNode } from 'web-tree-sitter'
import { doesCommentBelongToNode } from './utils'

const { hardline } = doc.builders

// These are separated with newline
export const separatedNodes = new Set([
  'if_statement',
  'while_statement',
  'do_while_statement',
  'for_statement',
  'for_in_statement',
  'switch_statement',
  'rule',
  'func_def',
])

/** Adds an empty line before and after some statements */
export function withNodesSeparator(
  printFn: Printer<TSNode | null>['print'],
): Printer<TSNode | null>['print'] {
  return function (path, options, print) {
    const node = path.node as TSNode
    const result = printFn(path, options, print)

    const shouldPrependNewline =
      node.previousNamedSibling &&
      (node.previousNamedSibling.type !== 'comment' ||
        doesCommentBelongToNode(node.previousNamedSibling))

    const shouldAppendNewline =
      node.nextNamedSibling &&
      !separatedNodes.has(node.nextNamedSibling.type) &&
      !doesCommentBelongToNode(node.nextNamedSibling)

    if (separatedNodes.has(node.type)) {
      return [
        shouldPrependNewline ? hardline : '',
        result,
        shouldAppendNewline ? hardline : '',
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
  printFn: Printer<TSNode | null>['print'],
): Printer<TSNode | null>['print'] {
  const nodeTypesToExclude = new Set(['rule', 'block', 'func_def'])

  return function (path, options, print) {
    const node = path.node as TSNode
    const result = printFn(path, options, print)

    if (nodeTypesToExclude.has(node.type)) return result

    if (
      !separatedNodes.has(node.type) &&
      node.previousNamedSibling &&
      !separatedNodes.has(node.previousNamedSibling.type)
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

/** This printer wrapper must be the outer one */
export function withNullNodeHandler(
  printFn: Printer<TSNode | null>['print'],
): Printer<TSNode | null>['print'] {
  return function (path, options, print) {
    const node = path.node

    if (node === null) return ''

    const result = printFn(path as AstPath<any>, options, print)
    return result
  }
}
