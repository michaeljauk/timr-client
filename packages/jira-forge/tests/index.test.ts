import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockBootstrap } = vi.hoisted(() => ({ mockBootstrap: vi.fn() }));

vi.mock("../src/resolvers/panel.js", () => ({
  bootstrap: mockBootstrap,
}));

let errSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  mockBootstrap.mockReset();
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  errSpy.mockRestore();
});

async function invoke(): Promise<unknown> {
  const { handler } = await import("../src/index.js");
  return handler(
    {
      call: { functionKey: "panel.bootstrap", payload: {} },
      context: { accountId: "acc-1" },
    },
    {},
  );
}

describe("panel.bootstrap resolver wrapper", () => {
  it("returns the bootstrap result on success", async () => {
    mockBootstrap.mockResolvedValue({
      accountId: "acc-1",
      issueKey: "NC-1",
      firstTasks: [],
    });
    await expect(invoke()).resolves.toMatchObject({ accountId: "acc-1" });
    expect(errSpy).not.toHaveBeenCalled();
  });

  it("re-throws the original Error so the UI sees the real message", async () => {
    mockBootstrap.mockRejectedValue(
      new Error("missing accountId in resolver context"),
    );
    await expect(invoke()).rejects.toThrow(/missing accountId/);
  });

  it("logs message+stack to console.error on failure", async () => {
    mockBootstrap.mockRejectedValue(new Error("timr 500 boom"));
    await expect(invoke()).rejects.toThrow();
    const detail = String(errSpy.mock.calls[0]?.[1] ?? "");
    expect(detail).toContain("Error");
    expect(detail).toContain("timr 500 boom");
  });

  it("wraps non-Error throws in an Error", async () => {
    mockBootstrap.mockRejectedValue("plain string");
    await expect(invoke()).rejects.toThrow(/plain string/);
    expect(errSpy).toHaveBeenCalled();
  });
});
