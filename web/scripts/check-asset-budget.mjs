import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const failures = [];
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const generatedRoot = fileURLToPath(new URL("../../assets/generated/", import.meta.url));
const maxCard = { width: 640, height: 960, bytes: 1.25 * 1024 * 1024 };
const maxVertical = { width: 768, height: 1152, bytes: 1.75 * 1024 * 1024 };
const maxEnemy = { width: 768, height: 1152, bytes: 1.75 * 1024 * 1024 };
const maxWide = { width: 1366, height: 768, bytes: 1.75 * 1024 * 1024 };

const pngFiles = (dir) => {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return pngFiles(path);
    return entry.name.endsWith(".png") ? [path] : [];
  });
};

const budgetFor = (metadata, path) => {
  const name = path.split("/").at(-1) || "";
  if (metadata.width >= metadata.height) return maxWide;
  if (name.startsWith("card_")) return maxCard;
  if (name.startsWith("enemy_")) return maxEnemy;
  return maxVertical;
};

for (const path of pngFiles(generatedRoot)) {
  const metadata = await sharp(path).metadata();
  const budget = budgetFor(metadata, path);
  const size = statSync(path).size;
  const label = relative(repoRoot, path);
  if (metadata.width > budget.width || metadata.height > budget.height) {
    failures.push(`${label} 尺寸 ${metadata.width}×${metadata.height} 超过 ${budget.width}×${budget.height}`);
  }
  if (size > budget.bytes) {
    failures.push(`${label} 体积 ${(size / 1024 / 1024).toFixed(2)} MiB 超过 ${(budget.bytes / 1024 / 1024).toFixed(2)} MiB`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  throw new Error(`Generated asset budget failed: ${failures.length} issue(s).`);
}

console.log(`Generated asset budget check passed: ${pngFiles(generatedRoot).length} generated PNG files stay within source limits.`);
