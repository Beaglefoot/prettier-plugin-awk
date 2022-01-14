import { doc, Printer } from 'prettier'
import { SyntaxNode } from 'tree-sitter'

const { group, join, line } = doc.builders

const allowedToSplit = new Set(['&&', '||'])

export const formatBinaryExp: Printer<SyntaxNode>['print'] = (path, _options, print) => {
  const node = path.getValue()

  if (!allowedToSplit.has(node.children[1].text))
    return join(' ', path.map(print, 'children'))

  return group([
    path.call(print, 'firstChild'),
    ' ',
    node.children[1].text,
    line,
    path.call(print, 'lastChild'),
  ])
}
