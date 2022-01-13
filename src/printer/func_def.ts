import { doc, Printer } from 'prettier'
import { SyntaxNode } from 'tree-sitter'

const { hardline, join, indent } = doc.builders

interface FunctionParams {
  params: string[]
  localVars: string[]
}

function splitParams(paramsText: string): string[] {
  return paramsText.replaceAll(' ', '').split(',').filter(Boolean)
}

function parseParams(paramsText: string): FunctionParams {
  const [paramsPart, ...localVarsPart] = paramsText.split('   ')

  const result = {
    params: splitParams(paramsPart),
    localVars: splitParams(localVarsPart.join('')),
  }

  return result
}

function formatParamsHorizontally(paramList: SyntaxNode): doc.builders.Doc[] {
  const initialParamsText = paramList?.text || ''
  const allParams = parseParams(initialParamsText)

  return [
    '(',
    allParams.params.join(', '),
    allParams.localVars.length ? ',   ' : '',
    allParams.localVars.join(', '),
    ')',
  ]
}

function formatParamsVertically(paramList: SyntaxNode): doc.builders.Doc[] {
  return [
    '(\\',
    indent([
      hardline,
      join(
        [',', hardline],
        paramList.namedChildren.map((c) => c.text),
      ),
      '\\',
    ]),
    hardline,
    ')',
  ]
}

export const formatFunctionDefinition: Printer<SyntaxNode>['print'] = (
  path,
  _options,
  print,
) => {
  const node = path.getValue()
  const paramList = node.descendantsOfType('param_list')[0]

  const formattedParams = paramList?.text.includes('\n')
    ? formatParamsVertically(paramList)
    : formatParamsHorizontally(paramList)

  return [
    'function ',
    node.descendantsOfType('identifier')[0].text,
    ...formattedParams,
    ' ',
    path.call(print, 'lastChild'),
  ]
}
