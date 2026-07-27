import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const npmCli = process.env.npm_execpath;
const temporaryDir = mkdtempSync(join(tmpdir(), "tinybase-client-package-"));

if (!npmCli) {
  throw new Error("Run this verifier through `npm run verify:package`");
}

function runNpm(args, options) {
  return execFileSync(process.execPath, [npmCli, ...args], options);
}

try {
  const packOutput = runNpm(["pack", "--json", "--pack-destination", temporaryDir], {
    cwd: packageDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  const [{ filename, files }] = JSON.parse(packOutput);
  const includedPaths = new Set(files.map(({ path }) => path));

  for (const requiredPath of [
    "LICENSE",
    "README.md",
    "dist/index.js",
    "dist/index.d.ts",
    "package.json",
  ]) {
    if (!includedPaths.has(requiredPath)) {
      throw new Error(`Packed artifact is missing ${requiredPath}`);
    }
  }

  runNpm(["init", "--yes"], { cwd: temporaryDir, stdio: "ignore" });
  runNpm(
    ["install", "--ignore-scripts", "--no-audit", "--no-fund", join(temporaryDir, filename)],
    { cwd: temporaryDir, stdio: "inherit" },
  );

  writeFileSync(
    join(temporaryDir, "consumer.mjs"),
    [
      'import { createClient, MemoryStorage } from "@knotree/client";',
      'if (typeof createClient !== "function") throw new Error("createClient export missing");',
      'if (typeof MemoryStorage !== "function") throw new Error("MemoryStorage export missing");',
      'console.log("@knotree/client packed artifact imports successfully");',
      "",
    ].join("\n"),
  );
  execFileSync(process.execPath, [join(temporaryDir, "consumer.mjs")], {
    cwd: temporaryDir,
    stdio: "inherit",
  });

  const installedManifest = JSON.parse(
    readFileSync(join(temporaryDir, "node_modules", "@knotree", "client", "package.json"), "utf8"),
  );
  if (installedManifest.private === true || installedManifest.publishConfig?.access !== "public") {
    throw new Error("Package is not configured for public publication");
  }
} finally {
  rmSync(temporaryDir, { recursive: true, force: true });
}
