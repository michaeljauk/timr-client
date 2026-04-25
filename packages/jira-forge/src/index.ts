import Resolver from "@forge/resolver";
import { bootstrap } from "./resolvers/panel";

const resolver = new Resolver();

resolver.define("panel.bootstrap", async (req) => {
  try {
    return await bootstrap(req);
  } catch (err) {
    // Forge logs are the only signal we have in M1, so emit message+stack
    // verbatim. Audit/redaction lands with the external sink in M4.
    const detail =
      err instanceof Error
        ? `${err.name}: ${err.message}\n${err.stack ?? ""}`
        : String(err);
    // eslint-disable-next-line no-console
    console.error("[resolver] panel.bootstrap failed", detail);

    // Surface the original message to the UI. The bootstrap throws are all
    // operator-readable ("missing accountId in resolver context",
    // "TIMR_CLIENT_ID … must be set", "timr API returned empty body (5xx)") —
    // collapsing them to a single string hides which class of failure happened.
    throw err instanceof Error ? err : new Error(String(err));
  }
});

export const handler = resolver.getDefinitions();
