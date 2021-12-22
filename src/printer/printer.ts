import { Printer, doc } from 'prettier'
import { SyntaxNode } from 'tree-sitter'
import { handleBlock } from './block'

const { hardline, indent, join } = doc.builders

export const printAwk: Printer<SyntaxNode>['print'] = (path, options, print) => {
  const node = path.getValue()

  if (node === null) return ''

  switch (node.type) {
    case 'program':
      return join([hardline, hardline], path.map(print, 'children'))

    case 'rule':
      return path.call(print, 'firstChild')

    case 'pattern':
      return [node.text, ' ', path.call(print, 'nextSibling')]

    case 'block':
      return handleBlock(path, options, print)

    case 'binary_exp':
    case 'assignment_exp':
      return [
        path.call(print, 'firstChild'),
        ' ',
        node.children[1].text,
        ' ',
        path.call(print, 'lastChild'),
      ]

    case 'func_call':
    case 'identifier':
    case 'number':
    case 'string':
      return node.text

    default:
      return ''
  }
}
