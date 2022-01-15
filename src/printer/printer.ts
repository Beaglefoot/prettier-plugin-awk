import { Printer, doc } from 'prettier'
import { SyntaxNode } from 'tree-sitter'
import { formatBinaryExp } from './binary_exp'
import { formatBlock } from './block'
import { formatFunctionDefinition } from './func_def'
import { formatIfStatement } from './if_statement'

const { hardline, join, group, indent, line, softline, ifBreak } = doc.builders

let nextNodeShouldBeIgnored = false

export const printAwk: Printer<SyntaxNode>['print'] = (path, options, print) => {
  const node = path.getValue()

  if (node.hasError()) {
    throw new Error('Document has syntax error')
  }

  if (nextNodeShouldBeIgnored) {
    nextNodeShouldBeIgnored = false
    return node.text
  }

  switch (node.type) {
    case 'program':
      return [join(hardline, path.map(print, 'children')), hardline]

    case 'directive':
      return [node.firstChild!.text, ' ', node.lastChild!.text]

    case 'func_def':
      return formatFunctionDefinition(path, options, print)

    case 'rule':
      return path.call(print, 'firstChild')

    case 'pattern':
      return [path.call(print, 'firstChild'), ' ', path.call(print, 'nextSibling')]

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
      return node.firstNamedChild
        ? group([
            'print',
            indent([ifBreak('\\'), line, path.map(print, 'namedChildren')]),
          ])
        : 'print'

    case 'printf_statement':
      // With parentheses because 'printf' with no arguments is invalid statement
      return group([
        'printf(',
        indent([
          ifBreak('\\'),
          softline,
          join([',', line], path.map(print, 'namedChildren')),
          ifBreak('\\'),
        ]),
        softline,
        ')',
      ])

    case 'unary_exp':
      return [path.call(print, 'firstChild'), path.call(print, 'lastNamedChild')]

    case 'field_ref':
    case 'indirect_func_call':
    case 'update_exp':
      return [path.call(print, 'firstChild'), path.call(print, 'lastChild')]

    case 'func_call':
      return group([
        path.call(print, 'firstChild'),
        '(',
        indent([
          ifBreak('\\'),
          softline,
          node.children[2]!.type !== ')' ? path.call(print, 'children', 2) : '',
          ifBreak('\\'),
        ]),
        softline,
        ')',
      ])

    case 'args':
    case 'exp_list':
      return group(join([',', line], path.map(print, 'namedChildren')))

    case 'grouping':
      return node.firstNamedChild!.childCount >= 3
        ? path.map(print, 'children')
        : path.call(print, 'firstNamedChild')

    case 'range_pattern':
      return join(', ', path.map(print, 'namedChildren'))

    case 'binary_exp':
      return formatBinaryExp(path, options, print)

    case 'redirected_io_statement':
    case 'piped_io_statement':
    case 'assignment_exp':
    case 'getline_input':
    case 'getline_file':
    case 'piped_io_exp':
    case 'return_statement':
    case 'exit_statement':
      return join(' ', path.map(print, 'children'))

    case 'ternary_exp':
      return group([
        path.call(print, 'namedChildren', 0),
        indent([line, '? ', path.call(print, 'namedChildren', 1)]),
        indent([line, ': ', path.call(print, 'namedChildren', 2)]),
      ])

    case 'array_ref':
      return group([
        path.call(print, 'firstNamedChild'),
        '[',
        indent([
          ifBreak('\\'),
          softline,
          path.call(print, 'namedChildren', 1),
          ifBreak('\\'),
        ]),
        softline,
        ']',
      ])

    case 'string_concat':
      return path.map(print, 'children')

    case 'concatenating_space':
      return ' '

    case 'comment':
      if (node.text.match(/#\s*prettier-ignore/)) {
        nextNodeShouldBeIgnored = true
      }

      return node.text

    case 'identifier':
    case 'number':
    case 'string':
    default:
      return node.text
  }
}
