import { chromium } from "playwright";

const base = "http://127.0.0.1:5174/";
const cases = [
  { name: "剑修终结", query: "origin=sword&card=万剑归岚&edge=5", hp: 67 },
  { name: "符师引爆", query: "origin=talisman&card=玄雷敕令&seals=4", hp: 76 },
  { name: "丹师热性爆发", query: "origin=alchemy&card=逆炼血丹&heat=3", hp: 73 },
  { name: "御灵协同", query: "origin=beast&card=百兽同途&contracts=4", hp: 84 },
  { name: "偃师机关终结", query: "origin=artificer&card=天工开物&devices=4&cunning=6", hp: 52 },
  { name: "契师燃魂", query: "origin=soul&card=魂火焚身&lamps=4", hp: 72 },
  { name: "契师弃牌终结", query: "origin=soul&card=百鬼夜行&lamps=5&discard=5", hp: 85 },
];

const browser = await chromium.launch({ headless: true });
const failures = [];

for (const test of cases) {
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  try {
    const url = `${base}?screen=combat&chapter=3&stage=3&enemyHp=100&qi=10&autoclick=1&${test.query}`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.locator(".combat-screen").waitFor();
    await page.waitForTimeout(1250);
    const hpText = await page.locator(".enemy-health strong").innerText();
    const actual = Number(hpText.split("/")[0]);
    if (actual !== test.hp) throw new Error(`expected ${test.hp}/100, got ${hpText}`);
    console.log(`✓ ${test.name}: ${actual}/100`);
  } catch (error) {
    failures.push(`${test.name}: ${error.message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}

await browser.close();

if (failures.length) {
  console.error(`Combat combo smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Combat combo smoke passed: ${cases.length} representative synergies.`);
