import { Printer, doc } from 'prettier'
import { SyntaxNode } from 'tree-sitter'

const {
  builders: { hardline },
} = doc

export const printAwk: Printer<SyntaxNode>['print'] = (path, _options, print) => {
  const node = path.getValue()

  if (node === null) return ''

  switch (node.type) {
    case 'program':
      return path.map(print, 'children')
    case 'rule':
      return path.call(print, 'firstChild')
    case 'pattern':
      return [node.text, ' ', path.call(print, 'nextSibling')]
    case 'block':
      return [node.text, hardline, hardline]
    case 'assignment_exp':
      return 'left = right'
    default:
      return ''
  }
}
