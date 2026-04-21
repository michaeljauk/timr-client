# timr-client

Community TypeScript SDK and CLI for the [timr](https://timr.com) time-tracking API.

Unofficial. Not affiliated with troii Software GmbH.

## Packages

| Package | Version | Description |
| --- | --- | --- |
| [`timr-sdk`](./packages/sdk) | [![npm](https://img.shields.io/npm/v/timr-sdk.svg)](https://www.npmjs.com/package/timr-sdk) | Fully typed client for the timr API |
| [`timr-cli`](./packages/cli) | [![npm](https://img.shields.io/npm/v/timr-cli.svg)](https://www.npmjs.com/package/timr-cli) | Command-line interface built on top of the SDK |

## Quickstart (SDK)

```ts
import { createTimrClient } from "timr-sdk";

const timr = createTimrClient({ token: process.env.TIMR_TOKEN! });

const { data, error } = await timr.GET("/project-times", {
  params: { query: { start_from: "2026-04-01", start_to: "2026-04-30" } },
});
```

## Quickstart (CLI)

```bash
export TIMR_TOKEN=your-bearer-token
pnpm dlx timr-cli project-times list --start-from 2026-04-01 --start-to 2026-04-30
```

## Why

The timr API has a published OpenAPI spec but no first-party TypeScript client. This repo ships a thin, fully-typed SDK generated from the spec, plus a CLI that's useful for scripting and audits (e.g. reconciling tracked hours against an issue tracker).

## Development

```bash
pnpm install
pnpm generate       # generate types from openapi.json
pnpm build
pnpm test
```

Spec version: `0.2.14` — pinned in `openapi.json`. Run `pnpm run update-spec` (from repo root) to bump.

## Versioning

Both packages use semantic versioning via [changesets](https://github.com/changesets/changesets). The SDK version tracks the spec version loosely (`0.x` = pre-1.0, may have breaking changes) until the timr API hits `1.0`.

## License

MIT © Michael Jauk
