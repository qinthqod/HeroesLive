export function retrySupportFor(streak = 0) {
  const tier = Math.min(3, Math.max(0, streak));
  if (!tier) return { tier: 0, stones: 0, skin: 0, clarity: 0, title: "尚无山门扶助", detail: "首次挑战保持完整难度。" };
  if (tier === 1) return { tier, stones: 0, skin: 1, clarity: 0, title: "守灯余火", detail: "下次启程额外携带 1 张石肤符。" };
  if (tier === 2) return { tier, stones: 4, skin: 1, clarity: 0, title: "同门资粮", detail: "下次启程额外获得 4 灵石与 1 张石肤符。" };
  return { tier, stones: 6, skin: 1, clarity: 1, title: "砚秋残笺", detail: "下次启程额外获得 6 灵石、1 张石肤符与 1 份清神粉；扶助已达上限。" };
}
