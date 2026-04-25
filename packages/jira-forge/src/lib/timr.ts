import { createTimrClient, type TimrClient } from "timr-sdk";

export interface TaskRef {
  id: string;
  breadcrumbs: string;
  bookable: boolean;
  billable: boolean;
}

let cached: TimrClient | null = null;

function getClient(): TimrClient {
  if (cached) return cached;
  const clientId = process.env["TIMR_CLIENT_ID"];
  const clientSecret = process.env["TIMR_CLIENT_SECRET"];
  const baseUrl = process.env["TIMR_BASE_URL"];
  if (!clientId || !clientSecret) {
    throw new Error("TIMR_CLIENT_ID and TIMR_CLIENT_SECRET must be set");
  }
  if (baseUrl && !/^https:\/\//i.test(baseUrl)) {
    throw new Error("TIMR_BASE_URL must use https://");
  }
  cached = createTimrClient({ clientId, clientSecret, baseUrl });
  return cached;
}

export async function listTasks(): Promise<TaskRef[]> {
  const client = getClient();
  const res = await client.GET("/tasks", {
    params: { query: { bookable: true, limit: 500 } },
  });
  if (res.data === undefined) {
    throw new Error(`timr API returned empty body (${res.response.status})`);
  }
  return (res.data.data ?? []).map((t) => ({
    id: t.id,
    breadcrumbs: t.breadcrumbs,
    bookable: t.bookable,
    billable: t.billable,
  }));
}
