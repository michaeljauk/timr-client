import { createTimrClient, type TimrClient } from "timr-sdk";
import { loadCredentials } from "./credentials.js";

let cached: TimrClient | null = null;

export async function getClient(): Promise<TimrClient> {
  if (cached) return cached;
  cached = await resolveClient();
  return cached;
}

async function resolveClient(): Promise<TimrClient> {
  const baseUrl = process.env.TIMR_BASE_URL;

  const staticToken = process.env.TIMR_TOKEN;
  if (staticToken) {
    return createTimrClient({ token: staticToken, baseUrl });
  }

  const clientId = process.env.TIMR_CLIENT_ID;
  const clientSecret = process.env.TIMR_CLIENT_SECRET;
  const tokenUrl = process.env.TIMR_TOKEN_URL;
  const scope = process.env.TIMR_SCOPE;

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

  throw new Error(
    "Not authenticated. Run `timr auth login` to store credentials, or set TIMR_CLIENT_ID + TIMR_CLIENT_SECRET (or TIMR_TOKEN).",
  );
}
