import { doc, Printer } from 'prettier'
import { SyntaxNode } from 'tree-sitter'

const { hardline, indent, join } = doc.builders

export const formatBlock: Printer<SyntaxNode>['print'] = (path, _options, print) => {
  const node = path.getValue()

  const statements_count = node.children.filter((node) => node.isNamed).length

  if (statements_count === 0) return ['{}']

  if (statements_count === 1) {
    return ['{ ', path.call(print, 'firstNamedChild'), ' }']
  }

  return [
    '{',
    indent([hardline, join(hardline, path.map(print, 'namedChildren'))]),
    hardline,
    '}',
  ]
}
