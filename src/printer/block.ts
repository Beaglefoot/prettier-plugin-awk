import { doc, Printer } from 'prettier'
import { SyntaxNode } from 'tree-sitter'
import { doesCommentBelongToNode } from './utils'
import { separatedNodes } from './wrappers'

const { hardline, indent, group, line } = doc.builders

export const formatBlock: Printer<SyntaxNode>['print'] = (path, _options, print) => {
  const node = path.getValue()

  const statementsCount = node.children.filter((node) => node.isNamed).length

  if (statementsCount === 0) return ['{}']

  if (
    statementsCount === 1 &&
    !separatedNodes.has(node.firstNamedChild!.type) &&
    node.descendantsOfType('comment').length === 0
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
