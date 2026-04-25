import { describe, expect, it } from "vitest";
import { listTasks } from "../src/lib/timr.js";

// Real-network probe against the timr API. Skipped unless both env vars are
// present, so CI and the default `pnpm test` run stay hermetic.
//
// Run locally:
//   export TIMR_CLIENT_ID=... TIMR_CLIENT_SECRET=...
//   pnpm test -- tests/integration.test.ts
const hasCreds =
  !!process.env["TIMR_CLIENT_ID"] && !!process.env["TIMR_CLIENT_SECRET"];

describe.skipIf(!hasCreds)("listTasks against real timr API", () => {
  it("returns at least one bookable task", async () => {
    const tasks = await listTasks();
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0]).toMatchObject({
      id: expect.any(String),
      breadcrumbs: expect.any(String),
      bookable: expect.any(Boolean),
      billable: expect.any(Boolean),
    });
  }, 15_000);
});
