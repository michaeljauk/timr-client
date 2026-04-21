export const DEFAULT_TOKEN_URL =
  "https://system.timr.com/id/oauth2/token";
export const DEFAULT_SCOPE = "timrclient openid";

export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  tokenUrl?: string;
  scope?: string;
}

export type TokenProvider = () => Promise<string>;

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

export function createOAuthTokenProvider(
  credentials: OAuthCredentials,
  fetchImpl: typeof globalThis.fetch = globalThis.fetch,
): TokenProvider {
  let cached: CachedToken | null = null;
  let inflight: Promise<CachedToken> | null = null;

  async function fetchToken(): Promise<CachedToken> {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      scope: credentials.scope ?? DEFAULT_SCOPE,
    });
    const res = await fetchImpl(
      credentials.tokenUrl ?? DEFAULT_TOKEN_URL,
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      },
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `OAuth token request failed: ${res.status} ${res.statusText} ${text.slice(0, 500)}`,
      );
    }
    const json = (await res.json()) as {
      access_token: string;
      expires_in?: number;
    };
    if (!json.access_token) {
      throw new Error("OAuth token response missing access_token");
    }
    const ttlSeconds = json.expires_in ?? 3600;
    return {
      accessToken: json.access_token,
      expiresAt: Date.now() + Math.max(0, (ttlSeconds - 60) * 1000),
    };
  }

  return async function getToken(): Promise<string> {
    if (cached && cached.expiresAt > Date.now()) return cached.accessToken;
    if (!inflight) {
      inflight = fetchToken().finally(() => {
        inflight = null;
      });
    }
    cached = await inflight;
    return cached.accessToken;
  };
}
