import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const pkgDir = join(import.meta.dirname, "..");

describe("skill frontmatter", () => {
  it("carries the package version", () => {
    const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8")) as { version: string };
    const skill = readFileSync(join(pkgDir, "skills", "timr", "SKILL.md"), "utf8");
    const match = /^version:\s*(\S+)/m.exec(skill);
    expect(match?.[1]).toBe(pkg.version);
  });
});
