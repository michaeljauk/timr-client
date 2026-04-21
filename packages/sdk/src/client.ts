import createClient, { type Client, type Middleware } from "openapi-fetch";
import type { paths } from "./generated.js";
import {
  createOAuthTokenProvider,
  type OAuthCredentials,
  type TokenProvider,
} from "./oauth.js";

export const DEFAULT_BASE_URL = "https://api.timr.com/v0.2/";

export interface TimrClientStaticTokenOptions {
  token: string;
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  headers?: Record<string, string>;
}

export interface TimrClientOAuthOptions extends OAuthCredentials {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  headers?: Record<string, string>;
}

export interface TimrClientProviderOptions {
  tokenProvider: TokenProvider;
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  headers?: Record<string, string>;
}

export type TimrClientOptions =
  | TimrClientStaticTokenOptions
  | TimrClientOAuthOptions
  | TimrClientProviderOptions;

export type TimrClient = Client<paths>;

export function createTimrClient(options: TimrClientOptions): TimrClient {
  const tokenProvider = resolveTokenProvider(options);

  const client = createClient<paths>({
    baseUrl: options.baseUrl ?? DEFAULT_BASE_URL,
    fetch: options.fetch,
    headers: options.headers,
  });

  const authMiddleware: Middleware = {
    async onRequest({ request }) {
      const token = await tokenProvider();
      request.headers.set("authorization", `Bearer ${token}`);
      return request;
    },
  };

  const errorMiddleware: Middleware = {
    async onResponse({ response }) {
      if (response.ok) return undefined;
      const body = await response.clone().text();
      throw new TimrError(
        `timr API ${response.status} ${response.statusText}: ${body.slice(0, 500)}`,
        { status: response.status, body },
      );
    },
  };

  client.use(authMiddleware, errorMiddleware);
  return client;
}

function resolveTokenProvider(options: TimrClientOptions): TokenProvider {
  if ("tokenProvider" in options) return options.tokenProvider;
  if ("token" in options) {
    if (!options.token) throw new TimrError("token is required");
    const t = options.token;
    return async () => t;
  }
  if (!options.clientId || !options.clientSecret) {
    throw new TimrError("clientId and clientSecret are required for OAuth");
  }
  return createOAuthTokenProvider(options, options.fetch);
}

export class TimrError extends Error {
  readonly status?: number;
  readonly body?: string;
  constructor(message: string, meta?: { status?: number; body?: string }) {
    super(message);
    this.name = "TimrError";
    this.status = meta?.status;
    this.body = meta?.body;
  }
}
