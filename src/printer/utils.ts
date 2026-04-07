import { Node as TSNode } from 'web-tree-sitter'

export function doesCommentBelongToNode(node: TSNode): boolean {
  if (!node.previousNamedSibling || node.type !== 'comment') return false

  return (
    node.previousNamedSibling.startPosition.row <= node.startPosition.row &&
    node.previousNamedSibling.endPosition.row >= node.startPosition.row
  )
}
