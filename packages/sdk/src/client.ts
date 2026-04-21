import createClient, { type Client, type Middleware } from "openapi-fetch";
import type { paths } from "./generated.js";

export const DEFAULT_BASE_URL = "https://api.timr.com/v0.2/";

export interface TimrClientOptions {
  token: string;
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  headers?: Record<string, string>;
}

export type TimrClient = Client<paths>;

export function createTimrClient(options: TimrClientOptions): TimrClient {
  if (!options.token) {
    throw new TimrError("TIMR_TOKEN is required");
  }

  const client = createClient<paths>({
    baseUrl: options.baseUrl ?? DEFAULT_BASE_URL,
    fetch: options.fetch,
    headers: {
      Authorization: `Bearer ${options.token}`,
      ...options.headers,
    },
  });

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
  client.use(errorMiddleware);

  return client;
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
