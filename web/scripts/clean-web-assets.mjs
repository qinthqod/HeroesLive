import { readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve(import.meta.dirname, "../../exports/web");
const removableExtensions = [".import", ".gdshader", ".uid"];
let removed = 0;

async function clean(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await clean(path);
      continue;
    }
    if (removableExtensions.some((extension) => entry.name.endsWith(extension))) {
      await rm(path);
      removed += 1;
    }
  }
}

await clean(output);
console.log(`Removed ${removed} Godot-only files from the Web deployment bundle.`);
