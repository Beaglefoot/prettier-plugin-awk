import { Printer, doc } from 'prettier'
import { SyntaxNode } from 'tree-sitter'
import { formatBlock } from './block'
import { formatFunctionDefinition } from './func_def'
import { formatIfStatement } from './if_statement'

const { hardline, join, indent } = doc.builders

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
        path.call(print, 'namedChildren', 0),
        '; ',
        path.call(print, 'namedChildren', 1),
        '; ',
        path.call(print, 'namedChildren', 2),
        ') ',
        path.call(print, 'lastNamedChild'),
      ]

    case 'for_in_statement':
      return [
        'for (',
        path.call(print, 'namedChildren', 0),
        ' in ',
        path.call(print, 'namedChildren', 1),
        ') ',
        path.call(print, 'lastNamedChild'),
      ]

    case 'while_statement':
      return [
        'while (',
        path.call(print, 'firstNamedChild'),
        ') ',
        path.call(print, 'lastNamedChild'),
      ]

    case 'do_while_statement':
      return [
        'do ',
        path.call(print, 'firstNamedChild'),
        hardline,
        'while (',
        path.call(print, 'lastNamedChild'),
        ')',
      ]

    case 'switch_statement':
      return [
        'switch (',
        path.call(print, 'firstNamedChild'),
        ') ',
        path.call(print, 'lastNamedChild'),
      ]

    case 'switch_body':
      return [
        '{',
        indent([hardline, join(hardline, path.map(print, 'namedChildren'))]),
        hardline,
        '}',
      ]

    case 'switch_case':
      return [
        'case ',
        path.call(print, 'children', 1),
        ':',
        node.children[3] ? indent([hardline, path.call(print, 'children', 3)]) : '',
      ]

    case 'switch_default':
      return ['default:', indent([hardline, path.call(print, 'lastNamedChild')])]

    case 'if_statement':
      return formatIfStatement(path, options, print)

    case 'print_statement':
      // No parentheses because 'print()' with no arguments is invalid statement
      return node.firstNamedChild ? ['print ', path.map(print, 'namedChildren')] : 'print'

    case 'printf_statement':
      // With parentheses because 'printf' with no arguments is invalid statement
      return [
        'printf(',
        node.firstNamedChild ? join(', ', path.map(print, 'namedChildren')) : '',
        ')',
      ]

    case 'redirected_io_statement':
    case 'piped_io_statement':
      return [
        path.call(print, 'children', 0),
        ' ',
        node.children[1].text,
        ' ',
        path.call(print, 'children', 2),
      ]

    case 'binary_exp':
    case 'assignment_exp':
      return [
        path.call(print, 'firstChild'),
        ' ',
        path.call(print, 'children', 1),
        ' ',
        path.call(print, 'lastChild'),
      ]

    case 'ternary_exp':
      return [
        path.call(print, 'children', 0),
        ' ? ',
        path.call(print, 'children', 2),
        ' : ',
        path.call(print, 'children', 4),
      ]

    case 'unary_exp':
      return [path.call(print, 'firstChild'), path.call(print, 'lastNamedChild')]

    case 'exp_list':
      return [join(', ', path.map(print, 'namedChildren'))]

    case 'identifier':
    case 'func_call':
    case 'number':
    case 'string':
    default:
      return node.text
  }
}
