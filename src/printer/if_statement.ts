import { Doc, doc, Printer } from 'prettier'
import { SyntaxNode } from 'tree-sitter'

const { hardline, group, indent, line } = doc.builders

export const formatIfStatement: Printer<SyntaxNode>['print'] = (
  path,
  _options,
  print,
) => {
  const node = path.getValue()
  const result: Doc[] = []

  result.push('if (', node.firstNamedChild!.text, ')')

  switch (node.children[4].type) {
    case ';':
      result.push(';')
      break
    case 'block':
      result.push(' ', path.call(print, 'children', 4))
      break
    default:
      result.push(group([indent([line, path.call(print, 'children', 4)])]))
  }

  const elseClause = node.descendantsOfType('else_clause')[0]

  if (elseClause) {
    result.push(hardline, 'else ', path.call(print, 'lastChild', 'lastChild'))
  }

  return result
}
