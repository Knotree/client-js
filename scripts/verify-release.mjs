import { readFileSync } from "node:fs";

const manifest = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const [tag] = process.argv.slice(2);
const expectedTag = `v${manifest.version}`;

if (tag !== expectedTag) {
  throw new Error(`Release tag ${JSON.stringify(tag)} must equal ${expectedTag}`);
}
if (manifest.name !== "@knotree/client") {
  throw new Error(`Unexpected package name: ${manifest.name}`);
}
if (manifest.license !== "Apache-2.0") {
  throw new Error(`Unexpected package license: ${manifest.license}`);
}
if (manifest.repository?.url !== "git+https://github.com/Knotree/client-js.git") {
  throw new Error(`Unexpected package repository: ${manifest.repository?.url}`);
}

console.log(`${manifest.name}@${manifest.version} is ready for trusted publishing`);
