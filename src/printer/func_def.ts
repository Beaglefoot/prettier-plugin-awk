import { doc, Printer } from 'prettier'
import { SyntaxNode } from 'tree-sitter'

const { hardline } = doc.builders

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

export const formatFunctionDefinition: Printer<SyntaxNode>['print'] = (
  path,
  _options,
  print,
) => {
  const node = path.getValue()
  const initialParamsText = node.descendantsOfType('param_list')[0]?.text || ''
  const allParams = parseParams(initialParamsText)

  return [
    node.previousSibling ? hardline : '',
    'function ',
    node.descendantsOfType('identifier')[0].text,
    '(',
    allParams.params.join(', '),
    allParams.localVars.length ? ',   ' : '',
    allParams.localVars.join(', '),
    ') ',
    path.call(print, 'lastChild'),
  ]
}
