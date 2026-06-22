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

for (const source of imageJobs) {
  const target = source.replace(/\.png$/i, ".webp");
  const temporary = `${target}.tmp`;
  const sourceSize = (await stat(source)).size;
  await sharp(source)
    .rotate()
    .webp({ quality: 84, alphaQuality: 92, effort: 5, smartSubsample: true })
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
