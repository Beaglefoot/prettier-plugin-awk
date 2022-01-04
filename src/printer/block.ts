import { doc, Printer } from 'prettier'
import { SyntaxNode } from 'tree-sitter'

const { hardline, indent, join } = doc.builders
const statementsOnNewline = new Set([
  'if_statement',
  'while_statement',
  'do_while_statement',
  'for_statement',
  'for_in_statement',
  'switch_statement',
])

export const formatBlock: Printer<SyntaxNode>['print'] = (path, _options, print) => {
  const node = path.getValue()

  const statementsCount = node.children.filter((node) => node.isNamed).length

  if (statementsCount === 0) return ['{}']

  if (statementsCount === 1 && !statementsOnNewline.has(node.firstNamedChild!.type)) {
    return ['{ ', path.call(print, 'firstNamedChild'), ' }']
  }

  return [
    '{',
    indent([hardline, join(hardline, path.map(print, 'namedChildren'))]),
    hardline,
    '}',
  ]
}
