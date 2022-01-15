import { SyntaxNode } from 'tree-sitter'

export function doesCommentBelongToNode(node: SyntaxNode): boolean {
  if (!node.previousNamedSibling || node.type !== 'comment') return false

  return (
    node.previousNamedSibling.startPosition.row <= node.startPosition.row &&
    node.previousNamedSibling.endPosition.row >= node.startPosition.row
  )
}
