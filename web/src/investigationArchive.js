import { CHAPTER_INVESTIGATIONS } from "./gameData.js";

export const INVESTIGATION_COMPLETION_REWARD = { spirit: 12, jade: 80 };

export function investigationEvidence(chapter) {
  const investigation = CHAPTER_INVESTIGATIONS[chapter];
  if (!investigation) return [];
  return [
    investigation.opening,
    ...investigation.routes.flatMap((route) => Object.values(route)),
  ].filter(Boolean);
}

export function mergeInvestigationArchive(profile, chapter, runClues) {
  const chapterKey = String(chapter);
  const knownEvidence = new Set(investigationEvidence(chapter));
  const previous = profile.investigationArchive?.[chapterKey] || [];
  const merged = [...new Set([...previous, ...runClues.filter((clue) => knownEvidence.has(clue))])];
  const rewardId = `investigation-${chapter}-complete`;
  const completed = merged.length === knownEvidence.size && knownEvidence.size > 0;
  const alreadyRewarded = (profile.investigationRewards || []).includes(rewardId);
  const newlyCompleted = completed && !alreadyRewarded;
  return {
    profile: {
      ...profile,
      investigationArchive: {
        ...(profile.investigationArchive || {}),
        [chapterKey]: merged,
      },
      investigationRewards: newlyCompleted
        ? [...(profile.investigationRewards || []), rewardId]
        : (profile.investigationRewards || []),
      spirit: (profile.spirit || 0) + (newlyCompleted ? INVESTIGATION_COMPLETION_REWARD.spirit : 0),
      jade: (profile.jade || 0) + (newlyCompleted ? INVESTIGATION_COMPLETION_REWARD.jade : 0),
    },
    newlyCompleted,
    count: merged.length,
    total: knownEvidence.size,
  };
}
