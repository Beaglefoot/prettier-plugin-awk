import { Printer, doc } from 'prettier'
import { SyntaxNode } from 'tree-sitter'
import { formatBlock } from './block'
import { formatFunctionDefinition } from './func_def'
import { formatIfStatement } from './if_statement'

const { hardline, join, group, indent, line } = doc.builders

export const printAwk: Printer<SyntaxNode>['print'] = (path, options, print) => {
  const node = path.getValue()

  if (node === null) return ''
  if (node.hasError()) {
    throw new Error('Document has syntax error')
  }

  switch (node.type) {
    case 'program':
      return [join(hardline, path.map(print, 'children')), hardline]

    case 'directive':
      return [node.firstChild!.text, ' ', node.lastChild!.text]

    case 'func_def':
      return formatFunctionDefinition(path, options, print)

    case 'rule':
      return [node.previousSibling ? hardline : '', path.call(print, 'firstChild')]

    case 'pattern':
      return [node.text, ' ', path.call(print, 'nextSibling')]

    case 'block':
      return formatBlock(path, options, print)

    case 'for_statement':
      return [
        'for (',
        node.namedChildren[0].text,
        '; ',
        node.namedChildren[1].text,
        '; ',
        node.namedChildren[2].text,
        ') ',
        path.call(print, 'lastNamedChild'),
      ]

    case 'for_in_statement':
      return [
        'for (',
        node.namedChildren[0].text,
        ' in ',
        node.namedChildren[1].text,
        ') ',
        path.call(print, 'lastNamedChild'),
      ]

    case 'while_statement':
      return [
        'while (',
        node.firstNamedChild!.text,
        ') ',
        path.call(print, 'lastNamedChild'),
      ]

    case 'do_while_statement':
      return [
        'do ',
        path.call(print, 'firstNamedChild'),
        hardline,
        'while (',
        node.lastNamedChild!.text,
        ')',
      ]

    case 'if_statement':
      return formatIfStatement(path, options, print)

    case 'binary_exp':
    case 'assignment_exp':
      return [
        path.call(print, 'firstChild'),
        ' ',
        node.children[1].text,
        ' ',
        path.call(print, 'lastChild'),
      ]

    case 'identifier':
    case 'func_call':
    case 'print_statement':
    case 'printf_statement':
    case 'number':
    case 'string':
    default:
      return node.text
  }
}
