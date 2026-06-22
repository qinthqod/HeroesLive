import { challengeCodeForRun, createChallengeCode, parseChallengeCode } from "../src/challengeCode.js";

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const code = createChallengeCode({
  chapter: 2,
  origin: "sword",
  modifierId: "blood_moon",
  seed: "NIGHT-20260621",
});
const parsed = parseChallengeCode(code);
expect(parsed.valid, "合法挑战码必须可解析");
expect(parsed.chapter === 2 && parsed.origin === "sword" && parsed.seed === "NIGHT-20260621", "挑战码必须保留章节、职业和种子");
expect(parsed.trial?.modifier?.id === "blood_moon", "挑战码必须还原真实异兆");
expect(!parseChallengeCode(code.replace("NIGHT-20260621", "NIGHT-20260622")).valid, "内容被篡改后必须拒绝导入");
expect(!parseChallengeCode("QL1.8.sword.none.TEST.0000").valid, "非法章节不得导入");
expect(challengeCodeForRun({ chapter: 4, job: "alchemy", seed: "QL-ABC", modifierId: "none" }).startsWith("QL1.4.alchemy.none.QL-ABC"), "普通战绩应能生成无异兆挑战码");
expect(challengeCodeForRun({ chapter: 1, job: "sword" }) === "", "旧战绩缺少种子时不得生成伪挑战码");

if (failures.length) {
  console.error(`Challenge code check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Challenge code check passed: ${code}`);
