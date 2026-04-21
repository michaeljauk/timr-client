import { describe, expect, it, vi } from "vitest";
import { createTimrClient, TimrError } from "../src/index.js";

describe("createTimrClient (static token)", () => {
  it("throws when token is empty", () => {
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
    const req = fetch.mock.calls[0]![0] as Request;
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

describe("createTimrClient (OAuth client_credentials)", () => {
  it("exchanges credentials for a token on first request", async () => {
    const fetch = vi.fn(async (input: Request | URL | string, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/oauth2/token")) {
        return new Response(
          JSON.stringify({ access_token: "exchanged_tok", expires_in: 3600 }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      return new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    const timr = createTimrClient({
      clientId: "cid@example.timr.com",
      clientSecret: "secret",
      fetch,
    });
    await timr.GET("/users");

    const tokenCall = fetch.mock.calls.find(([u]) => String(u instanceof Request ? u.url : u).includes("/oauth2/token"))!;
    const apiCall = fetch.mock.calls.find(([u]) => String(u instanceof Request ? u.url : u).includes("/v0.2/"))!;
    expect(tokenCall).toBeDefined();
    expect((apiCall[0] as Request).headers.get("authorization")).toBe(
      "Bearer exchanged_tok",
    );
  });

  it("caches the token across requests", async () => {
    let tokenCalls = 0;
    const fetch = vi.fn(async (input: Request | URL | string) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/oauth2/token")) {
        tokenCalls++;
        return new Response(
          JSON.stringify({ access_token: `tok_${tokenCalls}`, expires_in: 3600 }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      return new Response("{}", { status: 200, headers: { "content-type": "application/json" } });
    });
    const timr = createTimrClient({
      clientId: "cid",
      clientSecret: "secret",
      fetch,
    });
    await timr.GET("/users");
    await timr.GET("/tasks");
    await timr.GET("/teams");
    expect(tokenCalls).toBe(1);
  });

  it("propagates a failed token exchange", async () => {
    const fetch = vi.fn(async () =>
      new Response("invalid_client", { status: 401 }),
    );
    const timr = createTimrClient({
      clientId: "bad",
      clientSecret: "bad",
      fetch,
    });
    await expect(timr.GET("/users")).rejects.toThrow(
      /OAuth token request failed/,
    );
  });
});
