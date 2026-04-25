import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockListTasks } = vi.hoisted(() => ({ mockListTasks: vi.fn() }));

vi.mock("../src/lib/timr.js", () => ({
  listTasks: mockListTasks,
}));

beforeEach(() => {
  mockListTasks.mockReset();
});

import { bootstrap } from "../src/resolvers/panel.js";

const baseReq = {
  payload: {},
  context: {
    accountId: "acc-1",
    extension: { issue: { key: "NC-1" } },
  },
};

describe("bootstrap()", () => {
  it("returns accountId, issueKey, and the first 5 task refs", async () => {
    mockListTasks.mockResolvedValue(
      Array.from({ length: 12 }, (_, i) => ({
        id: `t${i}`,
        breadcrumbs: `b${i}`,
        bookable: true,
        billable: true,
      })),
    );
    const out = await bootstrap(baseReq);
    expect(out.accountId).toBe("acc-1");
    expect(out.issueKey).toBe("NC-1");
    expect(out.firstTasks).toHaveLength(5);
    expect(out.firstTasks[0]).toEqual({ id: "t0", breadcrumbs: "b0" });
  });

  it("throws when accountId is missing (fail-closed)", async () => {
    await expect(
      bootstrap({
        payload: {},
        context: { extension: { issue: { key: "NC-1" } } },
      }),
    ).rejects.toThrow(/accountId/);
  });

  it("throws when accountId is empty (fail-closed)", async () => {
    await expect(
      bootstrap({
        payload: {},
        context: { accountId: "", extension: { issue: { key: "NC-1" } } },
      }),
    ).rejects.toThrow(/accountId/);
  });

  it("throws when the issue key is missing (fail-closed)", async () => {
    await expect(
      bootstrap({
        payload: {},
        context: { accountId: "acc-1" },
      }),
    ).rejects.toThrow(/issue key/);
  });

  it("does not call the timr API when context is incomplete", async () => {
    await expect(
      bootstrap({ payload: {}, context: {} }),
    ).rejects.toThrow();
    expect(mockListTasks).not.toHaveBeenCalled();
  });

  it("propagates errors from listTasks", async () => {
    mockListTasks.mockRejectedValue(new Error("timr down"));
    await expect(bootstrap(baseReq)).rejects.toThrow(/timr down/);
  });

  it("returns an empty firstTasks array when there are no tasks", async () => {
    mockListTasks.mockResolvedValue([]);
    const out = await bootstrap(baseReq);
    expect(out.firstTasks).toEqual([]);
  });
});
