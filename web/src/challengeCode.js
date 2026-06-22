import { DAILY_MODIFIERS, seedHash } from "./dailyTrial.js";

const VERSION = "QL1";
const ORIGINS = new Set(["sword", "talisman", "alchemy", "beast", "artificer", "soul"]);
const SEED_PATTERN = /^[A-Z0-9-]{3,36}$/;

function checksum(payload) {
  return (seedHash(payload) & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

export function createChallengeCode({ chapter, origin, seed, modifierId = "none" }) {
  const safeChapter = Math.min(5, Math.max(1, Number(chapter) || 1));
  const safeOrigin = ORIGINS.has(origin) ? origin : "sword";
  const safeModifier = DAILY_MODIFIERS.some((item) => item.id === modifierId) ? modifierId : "none";
  const safeSeed = String(seed || "").trim().toUpperCase();
  if (!SEED_PATTERN.test(safeSeed)) throw new Error("invalid-seed");
  const payload = [VERSION, safeChapter, safeOrigin, safeModifier, safeSeed].join(".");
  return `${payload}.${checksum(payload)}`;
}

export function parseChallengeCode(input) {
  const normalized = String(input || "").trim();
  const parts = normalized.split(".");
  if (parts.length !== 6 || parts[0] !== VERSION) return { valid: false, reason: "format" };
  const [version, chapterText, origin, modifierId, seed, signature] = parts;
  const payload = [version, chapterText, origin, modifierId, seed].join(".");
  if (checksum(payload) !== signature.toUpperCase()) return { valid: false, reason: "checksum" };
  const chapter = Number(chapterText);
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 5) return { valid: false, reason: "chapter" };
  if (!ORIGINS.has(origin)) return { valid: false, reason: "origin" };
  if (!SEED_PATTERN.test(seed)) return { valid: false, reason: "seed" };
  const modifier = modifierId === "none" ? null : DAILY_MODIFIERS.find((item) => item.id === modifierId);
  if (modifierId !== "none" && !modifier) return { valid: false, reason: "modifier" };
  return {
    valid: true,
    code: normalized,
    chapter,
    origin,
    seed,
    modifierId,
    trial: modifier ? {
      dateKey: `challenge-${signature.toLowerCase()}`,
      dateLabel: "挑战复刻",
      seed,
      chapter,
      origin,
      modifier,
      title: `${modifier.name} · 第 ${chapter} 卷`,
    } : null,
  };
}

export function challengeCodeForRun(run) {
  if (!run?.seed || !run?.chapter || !run?.job) return "";
  return createChallengeCode({
    chapter: run.chapter,
    origin: run.job,
    seed: run.seed,
    modifierId: run.modifierId || "none",
  });
}
