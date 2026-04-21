# timr-sdk

Fully typed TypeScript SDK for the [timr](https://timr.com) time-tracking API.

Unofficial. Not affiliated with troii Software GmbH.

## Install

```bash
pnpm add timr-sdk
```

## Usage

```ts
import { createTimrClient } from "timr-sdk";

const timr = createTimrClient({ token: process.env.TIMR_TOKEN! });

const { data, error } = await timr.GET("/project-times", {
  params: {
    query: {
      start_from: "2026-04-01",
      start_to: "2026-04-30",
      limit: 100,
    },
  },
});

if (error) throw error;
console.log(data);
```

## Options

| Option | Description | Default |
| --- | --- | --- |
| `token` | timr API bearer token (required) | — |
| `baseUrl` | API base URL | `https://api.timr.com/v0.2/` |
| `fetch` | Custom fetch implementation | `globalThis.fetch` |
| `headers` | Additional default headers | `{}` |

## Errors

Non-2xx responses throw a `TimrError` with `status` and `body` populated.

```ts
import { TimrError } from "timr-sdk";

try {
  await timr.GET("/users");
} catch (err) {
  if (err instanceof TimrError) {
    console.error(err.status, err.body);
  }
}
```

## License

MIT © Michael Jauk
