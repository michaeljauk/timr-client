# timr-sdk

A fully typed TypeScript SDK for the [timr](https://timr.com) time-tracking API. Generated from the official OpenAPI spec.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/michaeljauk)

[![npm version](https://img.shields.io/npm/v/timr-sdk.svg)](https://www.npmjs.com/package/timr-sdk)
[![npm downloads](https://img.shields.io/npm/dm/timr-sdk.svg)](https://www.npmjs.com/package/timr-sdk)
[![install size](https://packagephobia.com/badge?p=timr-sdk)](https://packagephobia.com/result?p=timr-sdk)
[![provenance](https://img.shields.io/npm/v/timr-sdk.svg?label=provenance&color=2da44e)](https://www.npmjs.com/package/timr-sdk?activeTab=code)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)

---

Unofficial, community-maintained. Not affiliated with [troii Software GmbH](https://www.troii.com).

## Features

- Complete type coverage for every path, request body, query parameter, and response - generated from timr API `0.2.14`
- One runtime dependency: [`openapi-fetch`](https://openapi-ts.dev/openapi-fetch/) (~5 kB gzipped, zero deps itself)
- ESM, tree-shakeable, works in Node 20+, Bun, Deno, Cloudflare Workers, and Vercel Edge
- Throws a typed `TimrError` on any non-2xx response so you never get a surprise `undefined`

## Install

```bash
pnpm add timr-sdk
# or
npm install timr-sdk
# or
bun add timr-sdk
```

## Usage

### Authentication

The SDK supports three auth modes. Pick whichever fits your deployment.

```ts
import { createTimrClient } from "timr-sdk";

// 1. OAuth2 client_credentials (recommended for server-to-server)
const timr = createTimrClient({
  clientId: process.env.TIMR_CLIENT_ID!,
  clientSecret: process.env.TIMR_CLIENT_SECRET!,
  // tokenUrl: "https://system.timr.com/id/oauth2/token", // default
  // scope: "timrclient openid",                           // default
});

// 2. Static bearer token (personal scripts, CI)
const timr2 = createTimrClient({ token: process.env.TIMR_TOKEN! });

// 3. Custom token provider (rotate tokens from your secret store)
const timr3 = createTimrClient({
  tokenProvider: async () => await mySecretStore.getTimrToken(),
});
```

OAuth tokens are cached in memory and refreshed 60s before expiry. Concurrent requests share a single in-flight token exchange.

### Minimal

```ts
const { data } = await timr.GET("/users");
console.log(data?.data);
```

### Filtering

Every query parameter is typed. Your editor will autocomplete them.

```ts
const { data } = await timr.GET("/project-times", {
  params: {
    query: {
      start_from: "2026-04-01",
      start_to: "2026-04-30",
      users: ["user_abc", "user_def"],
      billable: true,
      limit: 500,
    },
  },
});
```

### Pagination

timr uses opaque page tokens. Walk pages like this:

```ts
async function* allProjectTimes() {
  let pageToken: string | undefined;
  do {
    const { data } = await timr.GET("/project-times", {
      params: { query: { page_token: pageToken, limit: 500 } },
    });
    yield* data?.data ?? [];
    pageToken = data?.next_page_token;
  } while (pageToken);
}

for await (const pt of allProjectTimes()) {
  // ...
}
```

### Creating and updating resources

Your editor autocompletes every field of every request body. Required fields are enforced at the type level.

```ts
await timr.POST("/project-times", {
  body: {
    // hover `body:` to see the full ProjectTimeCreate shape
    user_id: "user_abc",
    task_id: "task_xyz",
    start: "2026-04-21T09:00:00+02:00",
    changed: false,
    status: "changeable",
  },
});

await timr.PATCH("/project-times/{id}", {
  params: { path: { id: "pt_123" } },
  body: { notes: "Updated notes" },
});
```

For a flat, non-editor reference of every response shape see [`packages/cli/skills/timr/SCHEMA.md`](../cli/skills/timr/SCHEMA.md).

## Configuration

```ts
createTimrClient({
  // pick ONE of the auth modes:
  token: "...",                         // static bearer
  // clientId, clientSecret, tokenUrl?, scope?  // OAuth2 client_credentials
  // tokenProvider: async () => "..."           // custom

  baseUrl: "https://api.timr.com/v0.2/", // override for staging or self-hosted
  fetch: globalThis.fetch,               // inject a custom fetch (undici, msw, ...)
  headers: { "User-Agent": "my-app" },   // additional default headers
});
```

## Error handling

Non-2xx responses throw a `TimrError`:

```ts
import { TimrError } from "timr-sdk";

try {
  await timr.GET("/users/{id}", { params: { path: { id: "nope" } } });
} catch (err) {
  if (err instanceof TimrError) {
    console.error(err.status, err.body);
  }
}
```

Set up retries, logging, or telemetry by adding [middleware](https://openapi-ts.dev/openapi-fetch/middleware-auth) to the returned client:

```ts
timr.use({
  async onRequest({ request }) {
    console.log(">", request.method, request.url);
  },
});
```

## Types

Import the raw OpenAPI types if you need them:

```ts
import type { paths, components, operations } from "timr-sdk";

type ProjectTime = components["schemas"]["ProjectTime"];
type ListProjectTimesResponse =
  paths["/project-times"]["get"]["responses"][200]["content"]["application/json"];
```

## API reference

The timr API is documented on SwaggerHub:

- Interactive docs: <https://app.swaggerhub.com/apis-docs/troii/timr/0.2.13?view=elementsDocs>
- Raw spec (pinned): <https://api.swaggerhub.com/apis/troii/timr/0.2.14>

## Compatibility

| SDK version | timr API version |
|-------------|------------------|
| `0.1.x` | `0.2.14` |

The SDK stays on `0.x` until the timr API reaches `1.0`. Breaking changes in the API may require a minor bump until then.

## Support

If this SDK saves you time, consider [buying me a coffee](https://buymeacoffee.com/michaeljauk).

## License

MIT © [Michael Jauk](https://github.com/michaeljauk)
