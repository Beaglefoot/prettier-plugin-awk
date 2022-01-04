import { doc, Printer } from 'prettier'
import { SyntaxNode } from 'tree-sitter'
import { separatedStatements } from './statement'

const { hardline, indent, join } = doc.builders

export const formatBlock: Printer<SyntaxNode>['print'] = (path, _options, print) => {
  const node = path.getValue()

  const statementsCount = node.children.filter((node) => node.isNamed).length

  if (statementsCount === 0) return ['{}']

  if (statementsCount === 1 && !separatedStatements.has(node.firstNamedChild!.type)) {
    return ['{ ', path.call(print, 'firstNamedChild'), ' }']
  }

  return [
    '{',
    indent([hardline, join(hardline, path.map(print, 'namedChildren'))]),
    hardline,
    '}',
  ]
}
