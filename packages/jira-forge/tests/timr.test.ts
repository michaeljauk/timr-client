import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGET = vi.fn();
const mockCreate = vi.fn(() => ({ GET: mockGET }));

vi.mock("timr-sdk", () => ({
  createTimrClient: (...args: unknown[]) => mockCreate(...args),
}));

const ENV_KEYS = ["TIMR_CLIENT_ID", "TIMR_CLIENT_SECRET", "TIMR_BASE_URL"];
const originals: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of ENV_KEYS) originals[k] = process.env[k];
  process.env["TIMR_CLIENT_ID"] = "id";
  process.env["TIMR_CLIENT_SECRET"] = "secret";
  delete process.env["TIMR_BASE_URL"];
  vi.resetModules();
  mockCreate.mockClear();
  mockGET.mockReset();
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (originals[k] === undefined) delete process.env[k];
    else process.env[k] = originals[k];
  }
});

async function load() {
  return await import("../src/lib/timr.js");
}

describe("listTasks()", () => {
  it("throws when TIMR_CLIENT_ID is missing", async () => {
    delete process.env["TIMR_CLIENT_ID"];
    const { listTasks } = await load();
    await expect(listTasks()).rejects.toThrow(/TIMR_CLIENT_ID/);
  });

  it("throws when TIMR_CLIENT_SECRET is missing", async () => {
    delete process.env["TIMR_CLIENT_SECRET"];
    const { listTasks } = await load();
    await expect(listTasks()).rejects.toThrow(/TIMR_CLIENT_SECRET/);
  });

  it("rejects a non-https TIMR_BASE_URL", async () => {
    process.env["TIMR_BASE_URL"] = "http://api.timr.com";
    const { listTasks } = await load();
    await expect(listTasks()).rejects.toThrow(/https/);
  });

  it("caches the underlying SDK client across calls", async () => {
    mockGET.mockResolvedValue({
      data: { data: [] },
      response: new Response(null, { status: 200 }),
    });
    const { listTasks } = await load();
    await listTasks();
    await listTasks();
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("returns id+breadcrumbs+flags from the SDK response", async () => {
    mockGET.mockResolvedValue({
      data: {
        data: [
          {
            id: "t1",
            breadcrumbs: "Cust / A / B",
            bookable: true,
            billable: true,
          },
        ],
      },
      response: new Response(null, { status: 200 }),
    });
    const { listTasks } = await load();
    expect(await listTasks()).toEqual([
      { id: "t1", breadcrumbs: "Cust / A / B", bookable: true, billable: true },
    ]);
  });

  it("returns [] when the SDK body has no inner data array", async () => {
    mockGET.mockResolvedValue({
      data: {},
      response: new Response(null, { status: 200 }),
    });
    const { listTasks } = await load();
    await expect(listTasks()).resolves.toEqual([]);
  });

  it("throws when the SDK returns 2xx with empty body", async () => {
    mockGET.mockResolvedValue({
      response: new Response(null, { status: 204 }),
    });
    const { listTasks } = await load();
    await expect(listTasks()).rejects.toThrow(/empty body/);
  });

  it("propagates errors thrown by the SDK errorMiddleware", async () => {
    mockGET.mockRejectedValue(new Error("timr 401"));
    const { listTasks } = await load();
    await expect(listTasks()).rejects.toThrow(/timr 401/);
  });
});
