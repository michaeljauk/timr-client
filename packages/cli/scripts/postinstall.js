#!/usr/bin/env node
// Installs the timr skill to ~/.claude/skills/timr/ on global installs.
// Non-fatal: failures here must not break `npm install`.
import { mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillSrc = join(__dirname, "..", "skills", "timr", "SKILL.md");
const skillDir = join(homedir(), ".claude", "skills", "timr");
const skillDst = join(skillDir, "SKILL.md");

try {
  if (!existsSync(skillSrc)) process.exit(0);
  mkdirSync(skillDir, { recursive: true });
  copyFileSync(skillSrc, skillDst);
  console.log(`timr: Claude Code skill installed -> ${skillDst}`);
} catch {
  // swallow
}
