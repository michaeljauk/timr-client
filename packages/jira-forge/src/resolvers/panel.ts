import type { Request as ResolverRequest } from "@forge/resolver";
import { listTasks, type TaskRef } from "../lib/timr";

export interface PanelBootstrap {
  accountId: string;
  issueKey: string;
  firstTasks: Pick<TaskRef, "id" | "breadcrumbs">[];
}

export async function bootstrap(req: ResolverRequest): Promise<PanelBootstrap> {
  // Fail closed: missing accountId or issueKey means unauthenticated or
  // wrong context. Never substitute a sentinel — that would mis-attribute
  // every audit event and (later) timr entry.
  const accountId = req.context["accountId"];
  if (typeof accountId !== "string" || !accountId) {
    throw new Error("missing accountId in resolver context");
  }
  const issueKey = req.context["extension"]?.issue?.key;
  if (typeof issueKey !== "string" || !issueKey) {
    throw new Error("missing issue key in resolver context");
  }

  const tasks = await listTasks();
  return {
    accountId,
    issueKey,
    firstTasks: tasks.slice(0, 5).map((t) => ({
      id: t.id,
      breadcrumbs: t.breadcrumbs,
    })),
  };
}
