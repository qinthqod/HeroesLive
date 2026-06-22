const INSTRUCTION_KEYWORDS = new Set(["指令", "协同"]);

export function moonPhaseForTrial(trial) {
  if (trial?.modifier?.id === "blood_moon") return "blood";
  return "frost";
}

export function moonPhaseLabel(phase) {
  return phase === "blood" ? "血月" : "霜月";
}

export function discoverInstructions(drawPile, amount = 1, availableSlots = 7) {
  const limit = Math.max(0, Math.min(amount, availableSlots));
  const candidates = drawPile
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => INSTRUCTION_KEYWORDS.has(card.keyword))
    .sort((left, right) => left.card.cost - right.card.cost || left.index - right.index)
    .slice(0, limit);
  const indexes = new Set(candidates.map((candidate) => candidate.index));
  return {
    discovered: candidates.map((candidate) => candidate.card),
    remaining: drawPile.filter((_, index) => !indexes.has(index)),
  };
}

export function recallBeastState(state) {
  return {
    ...state,
    activeBeast: "",
    lastWasInstruction: false,
    beastDiscount: 0,
  };
}
