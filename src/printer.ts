import { Printer } from 'prettier'

export const printAwk: Printer['print'] = (path, options, print) => {
  const node = path.getValue()

  return node.text
}
