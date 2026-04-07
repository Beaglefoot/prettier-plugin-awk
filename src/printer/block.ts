import { doc, Printer } from 'prettier'
import { Node as TSNode } from 'web-tree-sitter'
import { doesCommentBelongToNode } from './utils'
import { separatedNodes } from './wrappers'

const { hardline, indent, group, line } = doc.builders

export const formatBlock: Printer<any>['print'] = (path, _options, print) => {
  const node = path.node as TSNode

  const statementsCount = node.children.filter((n: TSNode) => n.isNamed).length

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
      node.namedChildren.flatMap((n: TSNode, i: number) => {
        if (doesCommentBelongToNode(n)) return [' ', n.text]
        return [hardline, path.call(print, 'namedChildren', i)]
      }),
    ),
    hardline,
    '}',
  ]
}
