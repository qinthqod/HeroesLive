import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const src = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
const notebookSource = src("../src/runNotebook.js");
const mainSource = src("../src/main.jsx");
const cssSource = src("../src/styles.css");
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

for (const token of ["CHAPTER_INVESTIGATIONS", "currentBuildState", "nextProgressGoals", "healthAdvice", "rewardAdvice"]) {
  expect(notebookSource.includes(token), `试炼札记缺少 ${token} 数据来源`);
}
for (const screen of ["map", "combat", "reward", "event"]) {
  expect(mainSource.includes(`screen: "${screen}"`), `试炼札记未接入 ${screen} 页面`);
}
for (const prop of ["pendingClue", "profile", "clues", "routeProgress"]) {
  expect(mainSource.includes(prop), `试炼札记缺少 ${prop} 局内上下文`);
}
for (const klass of ["map-notebook", "combat-notebook", "reward-notebook", "event-notebook"]) {
  expect(mainSource.includes(klass) && cssSource.includes(klass), `缺少 ${klass} 的渲染或样式`);
}
expect(cssSource.includes("@media") && cssSource.includes(".combat-notebook header small"), "移动端战斗札记必须降噪，避免遮挡手牌与敌人");
expect(notebookSource.includes("待带回") && notebookSource.includes("构筑缺口") && notebookSource.includes("挑战卷"), "札记必须覆盖待查证线索、构筑缺口与长期挑战");

if (failures.length) {
  console.error(`Run notebook check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Run notebook check passed: in-run objectives connect investigation, build, survival, and long-term goals.");
