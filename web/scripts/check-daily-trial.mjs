import {
  DAILY_MODIFIERS,
  DAILY_TRIAL_REWARD,
  applyDailyEnemy,
  dailyRewardStatus,
  dailyTrialForDate,
  seededRandom,
  seededShuffle,
  settleDailyTrial,
} from "../src/dailyTrial.js";

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const date = new Date(2026, 5, 21, 12);
const first = dailyTrialForDate(date);
const second = dailyTrialForDate(new Date(2026, 5, 21, 23));
expect(JSON.stringify(first) === JSON.stringify(second), "同一天的试炼配置必须完全一致");
expect(first.seed === "NIGHT-20260621", "每日种子应由本地日期稳定生成");
expect(first.chapter >= 1 && first.chapter <= 5, "每日章节必须在五章范围内");
expect(["sword", "talisman", "alchemy", "beast", "artificer", "soul"].includes(first.origin), "每日职业必须来自六职业");
expect(DAILY_MODIFIERS.some((modifier) => modifier.id === first.modifier.id), "每日异兆必须来自已登记池");
expect(DAILY_TRIAL_REWARD.jade > 0 && DAILY_TRIAL_REWARD.spirit > 0 && DAILY_TRIAL_REWARD.xp > 0, "每日首胜应同时提供三类成长资源");

const randomA = Array.from({ length: 5 }, (_, index) => seededRandom(first.seed, `reward:${index}`));
const randomB = Array.from({ length: 5 }, (_, index) => seededRandom(first.seed, `reward:${index}`));
expect(JSON.stringify(randomA) === JSON.stringify(randomB), "同一种子和盐值必须复现随机序列");
expect(JSON.stringify(seededShuffle([1, 2, 3, 4, 5], first.seed, "opening")) === JSON.stringify(seededShuffle([1, 2, 3, 4, 5], first.seed, "opening")), "同一种子必须复现洗牌");

const enemy = { max: 100, hp: 100, moveIndex: 0, moves: [{ name: "试击", damage: 8 }, { name: "守势", shield: 6 }], intent: "试击" };
const bloodTrial = { modifier: DAILY_MODIFIERS.find((modifier) => modifier.id === "blood_moon") };
const bloodEnemy = applyDailyEnemy(enemy, bloodTrial);
expect(bloodEnemy.moves[0].damage === 10, "血月异兆必须真实提高敌人攻击");
expect(bloodEnemy.moves[1].shield === 6, "异兆不应误改非伤害招式");
expect(dailyRewardStatus({ completedDailyTrials: [first.dateKey] }, first).claimed, "已完成日期必须锁定首胜奖励");
expect(!dailyRewardStatus({ completedDailyTrials: [] }, first).claimed, "未完成日期应允许获得首胜奖励");
const claim = settleDailyTrial({ level: 3, xp: 90, jade: 10, spirit: 2, completedDailyTrials: [], unlockedTitles: [] }, first);
expect(claim.awarded && claim.profile.jade === 100 && claim.profile.spirit === 6 && claim.profile.xp === 120, "每日首胜应准确结算三类资源");
expect(claim.profile.equippedTitle === DAILY_TRIAL_REWARD.title, "每日首胜应装备纪念称号");
const duplicate = settleDailyTrial(claim.profile, first);
expect(!duplicate.awarded && duplicate.profile.jade === claim.profile.jade, "同一日期不得重复领取每日首胜");

if (failures.length) {
  console.error(`Daily trial check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Daily trial check passed: ${first.seed} deterministically selects ${first.origin}, chapter ${first.chapter}, and ${first.modifier.name}.`);
