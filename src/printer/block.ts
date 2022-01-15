import { doc, Printer } from 'prettier'
import { SyntaxNode } from 'tree-sitter'
import { separatedNodes } from './wrappers'

const { hardline, indent, group, line } = doc.builders

function doesCommentBelongToNode(node: SyntaxNode): boolean {
  if (!node.previousNamedSibling || node.type !== 'comment') return false

  return (
    node.previousNamedSibling.startPosition.row <= node.startPosition.row &&
    node.previousNamedSibling.endPosition.row >= node.startPosition.row
  )
}

export const formatBlock: Printer<SyntaxNode>['print'] = (path, _options, print) => {
  const node = path.getValue()

  const statementsCount = node.children.filter((node) => node.isNamed).length

  if (statementsCount === 0) return ['{}']

  if (
    statementsCount === 1 &&
    !separatedNodes.has(node.firstNamedChild!.type) &&
    node.firstNamedChild!.type !== 'comment'
  ) {
    return group(['{', indent([line, path.call(print, 'firstNamedChild')]), line, '}'])
  }

  return [
    '{',
    indent(
      node.namedChildren.flatMap((n, i) => {
        if (doesCommentBelongToNode(n)) return [' ', n.text]
        return [hardline, path.call(print, 'namedChildren', i)]
      }),
    ),
    hardline,
    '}',
  ]
}
