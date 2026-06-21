import { CHAPTERS } from "../src/gameData.js";
import { INVESTIGATION_COMPLETION_REWARD, investigationEvidence, mergeInvestigationArchive } from "../src/investigationArchive.js";

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

for (const chapter of CHAPTERS) {
  const evidence = investigationEvidence(chapter.id);
  expect(evidence.length === 7, `${chapter.name} 永久宗卷应有 7 条分支证据`);
  expect(new Set(evidence).size === evidence.length, `${chapter.name} 永久宗卷证据必须唯一`);

  const base = { spirit: 10, jade: 20, investigationArchive: {}, investigationRewards: [] };
  const firstHalf = mergeInvestigationArchive(base, chapter.id, evidence.slice(0, 4));
  expect(firstHalf.count === 4 && !firstHalf.newlyCompleted, `${chapter.name} 单局查明不得提前发放宗卷圆满奖励`);

  const completed = mergeInvestigationArchive(firstHalf.profile, chapter.id, evidence.slice(4));
  expect(completed.count === 7 && completed.newlyCompleted, `${chapter.name} 跨局补齐全部证据后必须完成宗卷`);
  expect(completed.profile.spirit === 10 + INVESTIGATION_COMPLETION_REWARD.spirit, `${chapter.name} 宗卷悟道奖励不正确`);
  expect(completed.profile.jade === 20 + INVESTIGATION_COMPLETION_REWARD.jade, `${chapter.name} 宗卷灵玉奖励不正确`);

  const repeated = mergeInvestigationArchive(completed.profile, chapter.id, evidence);
  expect(!repeated.newlyCompleted, `${chapter.name} 宗卷奖励必须幂等`);
  expect(repeated.profile.spirit === completed.profile.spirit && repeated.profile.jade === completed.profile.jade, `${chapter.name} 重复补证不得重复发奖`);
}

if (failures.length) {
  console.error(`Investigation archive check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Investigation archive check passed: five seven-clue dossiers merge across runs and reward exactly once.");
