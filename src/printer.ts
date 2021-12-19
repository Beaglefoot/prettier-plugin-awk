import { Printer } from 'prettier'
import { Tree } from 'tree-sitter'

export const printAwk: Printer<Tree>['print'] = (path, options, print) => {
  const tree = path.getValue()

  return tree.rootNode.toString()
}
