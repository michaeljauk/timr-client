import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runCommand } from "citty";
import { TimrError } from "timr-sdk";
import { workingTimeRequestsCommand } from "../src/commands/generated/working-time-requests.js";
import { mergeSpec } from "../scripts/load-spec.mjs";

const WARNING =
  "warn: working-time-requests is not part of the official timr API 1.0 spec and may stop working without notice.\n";

let calls: Request[];
let stdout: string[];
let stderr: string[];
let respond: () => Response;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  calls = [];
  stdout = [];
  stderr = [];
  respond = () => jsonResponse({ data: [], next_page_token: null });
  vi.stubEnv("TIMR_TOKEN", "test");
  vi.stubEnv("TIMR_BASE_URL", undefined);
  vi.stubGlobal("fetch", async (input: Request | string, init?: RequestInit) => {
    calls.push(input instanceof Request ? input : new Request(input, init));
    return respond();
  });
  vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
    stdout.push(String(chunk));
    return true;
  });
  vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
    stderr.push(String(chunk));
    return true;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function run(...rawArgs: string[]) {
  return runCommand(workingTimeRequestsCommand, { rawArgs });
}

describe("working-time-requests", () => {
  it("list sends repeated states and no statuses", async () => {
    await run("list", "--states", "approval_requested,in_approval");
    expect(calls).toHaveLength(1);
    const req = calls[0]!;
    const url = new URL(req.url);
    expect(req.method).toBe("GET");
    expect(url.origin + url.pathname).toBe("https://api.timr.com/v1/working-time-requests");
    expect(url.searchParams.getAll("states")).toEqual(["approval_requested", "in_approval"]);
    expect(url.searchParams.has("statuses")).toBe(false);
  });

  it("keeps stdout pure JSON and puts the warning on stderr only", async () => {
    respond = () =>
      jsonResponse({ data: [{ id: "req-1", state: "approval_requested" }], next_page_token: null });
    await run("list");
    expect(JSON.parse(stdout.join(""))).toEqual({
      data: [{ id: "req-1", state: "approval_requested" }],
      next_page_token: null,
    });
    expect(stdout.join("")).not.toContain("warn:");
    expect(stderr).toEqual([WARNING]);
  });

  it("delete sends DELETE to the request path", async () => {
    respond = () => new Response(null, { status: 204 });
    await run("delete", "req-1");
    const req = calls[0]!;
    expect(req.method).toBe("DELETE");
    expect(new URL(req.url).pathname).toBe("/v1/working-time-requests/req-1");
    expect(stderr).toEqual([WARNING]);
  });

  it("list-deleted hits the :deleted path", async () => {
    await run("list-deleted");
    const req = calls[0]!;
    expect(req.method).toBe("GET");
    expect(new URL(req.url).pathname).toBe("/v1/working-time-requests:deleted");
  });

  it("prints an endpoint hint when list gets a 404 and rethrows", async () => {
    respond = () => jsonResponse({ type: "https://errors.timr.com/not-found" }, 404);
    await expect(run("list")).rejects.toBeInstanceOf(TimrError);
    expect(stderr).toHaveLength(2);
    expect(stderr[0]).toBe(WARNING);
    expect(stderr[1]).toContain("hint: timr may no longer serve working-time-requests");
  });

  it("names the unknown id first when get gets a 404", async () => {
    respond = () => jsonResponse({ type: "https://errors.timr.com/not-found" }, 404);
    await expect(run("get", "req-1")).rejects.toBeInstanceOf(TimrError);
    expect(stderr).toHaveLength(2);
    expect(stderr[1]).toContain("hint: the id was not found, or timr no longer serves working-time-requests");
  });

  it("prints no hint on other errors", async () => {
    respond = () => jsonResponse({ type: "https://errors.timr.com/forbidden" }, 403);
    await expect(run("get", "req-1")).rejects.toBeInstanceOf(TimrError);
    expect(stderr).toEqual([WARNING]);
  });
});

describe("mergeSpec", () => {
  const operation = { summary: "x" };
  const fragment = {
    paths: {
      "/a": { get: { ...operation, "x-timr-undocumented": true } },
      "/b": { get: { ...operation, "x-timr-undocumented": true } },
    },
    components: { schemas: { A: { type: "string" }, B: { type: "number" } } },
  };

  it("adds fragment entries missing from the official spec", () => {
    const warn = vi.fn();
    const merged = mergeSpec({ paths: {}, components: { schemas: {} } }, fragment, warn);
    expect(Object.keys(merged.paths)).toEqual(["/a", "/b"]);
    expect(merged.paths["/a"].get["x-timr-undocumented"]).toBe(true);
    expect(Object.keys(merged.components.schemas)).toEqual(["A", "B"]);
    expect(warn).not.toHaveBeenCalled();
  });

  it("lets the official spec win and warns about obsolete entries", () => {
    const warn = vi.fn();
    const official = {
      paths: { "/a": { get: { summary: "official" } } },
      components: { schemas: { A: { type: "integer" } } },
    };
    const merged = mergeSpec(official, fragment, warn);
    expect(merged.paths["/a"].get.summary).toBe("official");
    expect(merged.paths["/b"].get["x-timr-undocumented"]).toBe(true);
    expect(merged.components.schemas.A).toEqual({ type: "integer" });
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0]![0]).toContain("GET /a is obsolete");
    expect(warn.mock.calls[1]![0]).toContain("schema A is obsolete");
  });
});
