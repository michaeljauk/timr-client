import { TimrError, type TimrClient } from "timr-sdk";
import { getClient } from "./client.js";

export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  contentType?: string;
  rawBody?: boolean;
}

/**
 * Bridge the `request` function expected by @cloudflare/codemode's
 * openApiMcpServer onto timr-sdk. Runs on the host (never in sandbox), so
 * auth is injected by the SDK and never exposed to agent-authored code.
 */
export async function request(opts: RequestOptions): Promise<unknown> {
  const client = await getClient();
  const query = stripUndefined(opts.query);
  const params: Record<string, unknown> = {};
  const pathParams = extractPathParams(opts.path, query);
  if (Object.keys(pathParams).length) params.path = pathParams;
  if (Object.keys(query).length) params.query = query;

  const callOpts: Record<string, unknown> = {};
  if (Object.keys(params).length) callOpts.params = params;
  if (opts.body !== undefined) callOpts.body = opts.body;

  const caller = client[opts.method] as (
    path: string,
    options: unknown,
  ) => Promise<{ data: unknown }>;

  try {
    const { data } = await caller(opts.path as never, callOpts as never);
    return data ?? null;
  } catch (err) {
    if (err instanceof TimrError) {
      throw new Error(`timr API ${err.status ?? "?"}: ${err.message}`);
    }
    throw err;
  }
}

function stripUndefined(
  input: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!input) return out;
  for (const [k, v] of Object.entries(input)) {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  }
  return out;
}

/**
 * openApiMcpServer's `request` signature doesn't separate path params from
 * query — the LLM passes `{method, path, query}` with `path` already filled
 * (e.g. "/users/abc123"). But codemode also lets agents pass template-style
 * paths with `{id}` placeholders, in which case we pluck matching keys out
 * of `query` and substitute them.
 */
function extractPathParams(
  path: string,
  query: Record<string, unknown>,
): Record<string, string> {
  const placeholders = [...path.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
  if (placeholders.length === 0) return {};
  const pathParams: Record<string, string> = {};
  for (const name of placeholders) {
    if (name === undefined) continue;
    const val = query[name];
    if (val === undefined) {
      throw new Error(
        `Missing path parameter "${name}" for ${path} — pass it in the query object.`,
      );
    }
    pathParams[name] = String(val);
    delete query[name];
  }
  return pathParams;
}
