export function createPendingClue(text, node, route) {
  if (!text) return null;
  return {
    text,
    nodeId: node.id,
    nodeName: node.name,
    route,
  };
}

export function settlePendingClue(clues, pendingClue) {
  if (!pendingClue?.text) {
    return { clues: [...clues], pendingClue: null, recovered: "" };
  }
  return {
    clues: [...new Set([...clues, pendingClue.text])],
    pendingClue: null,
    recovered: pendingClue.text,
  };
}
