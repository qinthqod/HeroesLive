import { readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";
import sharp from "sharp";

const output = resolve(import.meta.dirname, "../../exports/web");
const textExtensions = new Set([".html", ".css", ".js"]);
const imageJobs = [];
const textFiles = [];

async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await collect(path);
      continue;
    }
    const extension = extname(entry.name).toLowerCase();
    if (extension === ".png") imageJobs.push(path);
    if (textExtensions.has(extension)) textFiles.push(path);
  }
}

await collect(output);

const replacements = new Map();
let originalBytes = 0;
let optimizedBytes = 0;
let converted = 0;

const resizeBudgetFor = (path) => {
  const normalized = relative(output, path).replaceAll("\\", "/");
  const name = normalized.split("/").at(-1) || "";
  if (name.startsWith("card_") || name.startsWith("enemy_")) return { width: 768, height: 1152 };
  if (normalized.includes("/bg_") || name.startsWith("bg_")) return { width: 1366, height: 768 };
  if (normalized.includes("web_combat_reference")) return { width: 1366, height: 768 };
  return null;
};

for (const source of imageJobs) {
  const target = source.replace(/\.png$/i, ".webp");
  const temporary = `${target}.tmp`;
  const sourceSize = (await stat(source)).size;
  const resizeBudget = resizeBudgetFor(source);
  let pipeline = sharp(source).rotate();
  if (resizeBudget) {
    pipeline = pipeline.resize({ ...resizeBudget, fit: "inside", withoutEnlargement: true });
  }
  await pipeline
    .webp({ quality: 82, alphaQuality: 92, effort: 5, smartSubsample: true })
    .toFile(temporary);
  const targetSize = (await stat(temporary)).size;
  originalBytes += sourceSize;

  if (targetSize >= sourceSize * 0.96) {
    optimizedBytes += sourceSize;
    await rm(temporary);
    continue;
  }

  await rename(temporary, target);
  await rm(source);
  const sourceRelative = relative(output, source).replaceAll("\\", "/");
  const targetRelative = relative(output, target).replaceAll("\\", "/");
  replacements.set(sourceRelative, targetRelative);
  optimizedBytes += targetSize;
  converted += 1;
}

for (const file of textFiles) {
  const original = await readFile(file, "utf8");
  let updated = original;
  for (const [source, target] of replacements) {
    updated = updated.replaceAll(source, target);
  }
  if (updated !== original) await writeFile(file, updated);
}

const saved = originalBytes - optimizedBytes;
const percent = originalBytes ? Math.round(saved / originalBytes * 100) : 0;
console.log(`Converted ${converted}/${imageJobs.length} PNG files to WebP; image payload saved ${(saved / 1024 / 1024).toFixed(1)} MiB (${percent}%).`);
