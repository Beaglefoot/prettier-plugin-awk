import { Doc, doc, Printer } from 'prettier'
import { SyntaxNode } from 'tree-sitter'

const { hardline, group, indent, line, softline, ifBreak } = doc.builders

export const formatIfStatement: Printer<SyntaxNode>['print'] = (
  path,
  _options,
  print,
) => {
  const node = path.getValue()
  const result: Doc[] = []

  result.push(
    group([
      'if (',
      indent([
        ifBreak('\\'),
        softline,
        path.call(print, 'firstNamedChild'),
        ifBreak('\\'),
      ]),
      softline,
      ')',
    ]),
  )

  switch (node.children[4].type) {
    case ';':
      result.push(';')
      break
    case 'block':
      result.push(' ', path.call(print, 'children', 4))
      break
    case 'comment':
      result.push(
        ' ',
        path.call(print, 'children', 4),
        node.children[5].type === 'block'
          ? [hardline, path.call(print, 'children', 5)]
          : indent([hardline, path.call(print, 'children', 5)]),
      )
      break
    default:
      result.push(group([indent([line, path.call(print, 'children', 4)])]))
  }

  const elseClause =
    node.lastNamedChild!.type === 'else_clause' ? node.lastNamedChild : null

  if (elseClause) {
    result.push(hardline, 'else ', path.call(print, 'lastChild', 'lastChild'))
  }

  return result
}
