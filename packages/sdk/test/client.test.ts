import { describe, expect, it, vi } from "vitest";
import { createTimrClient, TimrError } from "../src/index.js";

describe("createTimrClient", () => {
  it("throws when token is missing", () => {
    expect(() => createTimrClient({ token: "" })).toThrow(TimrError);
  });

  it("sends bearer auth header", async () => {
    const fetch = vi.fn(async () =>
      new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const timr = createTimrClient({ token: "tok_123", fetch });
    await timr.GET("/users");
    const call = fetch.mock.calls[0]!;
    const req = call[0] as Request;
    expect(req.headers.get("authorization")).toBe("Bearer tok_123");
  });

  it("throws TimrError on non-2xx", async () => {
    const fetch = vi.fn(async () =>
      new Response("forbidden", { status: 403 }),
    );
    const timr = createTimrClient({ token: "tok", fetch });
    await expect(timr.GET("/users")).rejects.toMatchObject({
      name: "TimrError",
      status: 403,
    });
  });
});
