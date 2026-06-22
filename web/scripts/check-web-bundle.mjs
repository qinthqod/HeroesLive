import { access, readdir, readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";

const output = resolve(import.meta.dirname, "../../exports/web");
const textExtensions = new Set([".html", ".css", ".js"]);
const textFiles = [];
const pngFiles = [];
const missingImages = new Set();
let totalBytes = 0;

async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await collect(path);
      continue;
    }

    totalBytes += (await stat(path)).size;
    const extension = extname(entry.name).toLowerCase();
    if (extension === ".png") pngFiles.push(path);
    if (textExtensions.has(extension)) textFiles.push(path);
  }
}

await collect(output);

for (const file of textFiles) {
  const source = await readFile(file, "utf8");
  if (/\.png(?:[?#"'`)\\]|$)/i.test(source)) {
    throw new Error(`PNG reference remains in ${file}`);
  }

  for (const match of source.matchAll(/(?:\.\.\/|\.\/|\/)?[\w./-]+\.webp(?:\?[^"'`()\s\\]*)?/gi)) {
    const reference = match[0].split("?")[0];
    const target = reference.startsWith("/")
      ? resolve(output, reference.slice(1))
      : resolve(dirname(file), reference);
    try {
      await access(target);
    } catch {
      missingImages.add(`${reference} (from ${file})`);
    }
  }
}

if (pngFiles.length) {
  throw new Error(`Production bundle still contains ${pngFiles.length} PNG file(s).`);
}

if (missingImages.size) {
  throw new Error(`Missing WebP assets:\n${[...missingImages].join("\n")}`);
}

const maxBytes = 10 * 1024 * 1024;
if (totalBytes > maxBytes) {
  throw new Error(`Production bundle is ${(totalBytes / 1024 / 1024).toFixed(1)} MiB; limit is 10 MiB.`);
}

console.log(`Production bundle verified: ${(totalBytes / 1024 / 1024).toFixed(1)} MiB, no PNG files, and all WebP references resolve.`);
