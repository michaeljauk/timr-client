import {
  createTimrClient,
  DEFAULT_SCOPE,
  DEFAULT_TOKEN_URL,
  type TimrClient,
} from "timr-sdk";
import { consola } from "consola";
import { loadCredentials } from "../lib/credentials.js";

export interface GlobalArgs {
  token?: string;
  "client-id"?: string;
  "client-secret"?: string;
  "token-url"?: string;
  scope?: string;
  "base-url"?: string;
}

export const globalArgs = {
  token: {
    type: "string",
    description: "Static bearer token (defaults to $TIMR_TOKEN)",
  },
  "client-id": {
    type: "string",
    description: "OAuth client id (defaults to $TIMR_CLIENT_ID or stored credentials)",
  },
  "client-secret": {
    type: "string",
    description: "OAuth client secret (defaults to $TIMR_CLIENT_SECRET or stored credentials)",
  },
  "token-url": {
    type: "string",
    description: `OAuth token endpoint (defaults to $TIMR_TOKEN_URL or ${DEFAULT_TOKEN_URL})`,
  },
  scope: {
    type: "string",
    description: `OAuth scope (defaults to $TIMR_SCOPE or "${DEFAULT_SCOPE}")`,
  },
  "base-url": {
    type: "string",
    description: "API base URL (defaults to $TIMR_BASE_URL)",
  },
} as const;

export async function resolveClient(args: GlobalArgs): Promise<TimrClient> {
  const baseUrl = args["base-url"] ?? process.env.TIMR_BASE_URL;

  const staticToken = args.token ?? process.env.TIMR_TOKEN;
  if (staticToken) {
    return createTimrClient({ token: staticToken, baseUrl });
  }

  const clientId = args["client-id"] ?? process.env.TIMR_CLIENT_ID;
  const clientSecret = args["client-secret"] ?? process.env.TIMR_CLIENT_SECRET;
  const tokenUrl = args["token-url"] ?? process.env.TIMR_TOKEN_URL;
  const scope = args.scope ?? process.env.TIMR_SCOPE;

  if (clientId && clientSecret) {
    return createTimrClient({ clientId, clientSecret, tokenUrl, scope, baseUrl });
  }

  const stored = await loadCredentials();
  if (stored) {
    return createTimrClient({
      clientId: stored.clientId,
      clientSecret: stored.clientSecret,
      tokenUrl: tokenUrl ?? stored.tokenUrl,
      scope: scope ?? stored.scope,
      baseUrl: baseUrl ?? stored.baseUrl,
    });
  }

  consola.error(
    "Not authenticated. Run `timr auth login` to store credentials, or set TIMR_CLIENT_ID + TIMR_CLIENT_SECRET (or TIMR_TOKEN).",
  );
  process.exit(2);
}

export function printJson(value: unknown): void {
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}

export async function readBody(dataFlag: string | undefined): Promise<unknown> {
  if (dataFlag != null && dataFlag !== "") {
    if (dataFlag === "-") return await readStdin();
    if (dataFlag.startsWith("@")) {
      const { readFile } = await import("node:fs/promises");
      return JSON.parse(await readFile(dataFlag.slice(1), "utf8"));
    }
    return JSON.parse(dataFlag);
  }
  if (!process.stdin.isTTY) return await readStdin();
  consola.error(
    "Request body required. Pass --data '<json>', --data @file.json, --data -, or pipe JSON via stdin.",
  );
  process.exit(1);
}

async function readStdin(): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (raw === "") {
    consola.error("Empty body on stdin.");
    process.exit(1);
  }
  return JSON.parse(raw);
}

export function numOrUndef(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function csv(v: unknown): string[] | undefined {
  if (typeof v !== "string" || v === "") return undefined;
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}
