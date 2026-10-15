import { rolldown } from "rolldown";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const directory = await mkdtemp(join(tmpdir(), "tindapos-tests-"));
try {
  const bundle = await rolldown({
    input: "tests/phase2.ts",
    platform: "node",
    external: ["node:assert/strict"],
  });
  await bundle.write({
    dir: directory,
    format: "esm",
    entryFileNames: "phase2.mjs",
  });
  await bundle.close();
  await import(pathToFileURL(join(directory, "phase2.mjs")).href);
} finally {
  await rm(directory, { recursive: true, force: true });
}
