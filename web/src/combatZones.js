export function isCurse(card) {
  return card?.job === "curse" || card?.type === "心魔";
}

export function countCurses(zones) {
  const piles = ["hand", "discardPile", "drawPile", "exhaustPile"].map((zone) => zones[zone] || []);
  return piles.reduce(
    (total, cards) => total + (cards || []).filter(isCurse).length,
    0,
  );
}

export function purgeCurses(zones, limit = 1) {
  let remaining = Math.max(0, limit);
  const removed = [];
  const next = {};

  for (const [zone, cards = []] of Object.entries(zones)) {
    next[zone] = cards.filter((card) => {
      if (!remaining || !isCurse(card)) return true;
      remaining -= 1;
      removed.push(card);
      return false;
    });
  }

  return { ...next, removed };
}
