import { createTimrClient, type TimrClient } from "timr-sdk";
import { consola } from "consola";

export interface GlobalArgs {
  token?: string;
  "base-url"?: string;
}

export const globalArgs = {
  token: {
    type: "string",
    description: "timr API bearer token (defaults to $TIMR_TOKEN)",
  },
  "base-url": {
    type: "string",
    description: "Override API base URL (defaults to $TIMR_BASE_URL)",
  },
} as const;

export function resolveClient(args: GlobalArgs): TimrClient {
  const token = args.token ?? process.env.TIMR_TOKEN;
  if (!token) {
    consola.error(
      "No token. Set TIMR_TOKEN or pass --token <token>.",
    );
    process.exit(1);
  }
  const baseUrl = args["base-url"] ?? process.env.TIMR_BASE_URL;
  return createTimrClient({ token, baseUrl });
}

export function printJson(value: unknown): void {
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}
