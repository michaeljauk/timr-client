import { defineCommand } from "citty";
import { consola } from "consola";
import {
  createOAuthTokenProvider,
  DEFAULT_SCOPE,
  DEFAULT_TOKEN_URL,
} from "timr-sdk";
import {
  CREDENTIALS_FILE,
  clearCredentials,
  credentialsFileMode,
  loadCredentials,
  saveCredentials,
} from "../lib/credentials.js";

const login = defineCommand({
  meta: {
    name: "login",
    description: "Store OAuth client credentials and verify them",
  },
  args: {
    "client-id": { type: "string", description: "OAuth client id" },
    "client-secret": { type: "string", description: "OAuth client secret" },
    "token-url": {
      type: "string",
      description: `OAuth token endpoint (default: ${DEFAULT_TOKEN_URL})`,
    },
    scope: {
      type: "string",
      description: `OAuth scope (default: "${DEFAULT_SCOPE}")`,
    },
    "base-url": {
      type: "string",
      description: "Override API base URL",
    },
  },
  async run({ args }) {
    const clientId =
      (args["client-id"] as string | undefined) ??
      (await consola.prompt("Client ID", { type: "text" }));
    const clientSecret =
      (args["client-secret"] as string | undefined) ??
      (await consola.prompt("Client Secret", { type: "text" }));

    if (!clientId || !clientSecret) {
      consola.error("Client ID and Client Secret are required.");
      process.exit(1);
    }

    const tokenUrl =
      (args["token-url"] as string | undefined) || undefined;
    const scope = (args.scope as string | undefined) || undefined;
    const baseUrl = (args["base-url"] as string | undefined) || undefined;

    consola.start("Verifying credentials...");
    const provider = createOAuthTokenProvider({
      clientId,
      clientSecret,
      tokenUrl,
      scope,
    });
    try {
      await provider();
    } catch (err) {
      consola.error(
        `Credentials rejected by ${tokenUrl ?? DEFAULT_TOKEN_URL}:\n${err instanceof Error ? err.message : String(err)}`,
      );
      process.exit(1);
    }

    const path = await saveCredentials({
      clientId,
      clientSecret,
      tokenUrl,
      scope,
      baseUrl,
    });

    consola.success(`Credentials saved to ${path}`);
    consola.info("File mode: 600 (owner read/write only)");
  },
});

const logout = defineCommand({
  meta: { name: "logout", description: "Remove stored credentials" },
  async run() {
    const removed = await clearCredentials();
    if (removed) consola.success(`Removed ${CREDENTIALS_FILE}`);
    else consola.info("No stored credentials to remove.");
  },
});

const status = defineCommand({
  meta: {
    name: "status",
    description: "Show current auth status",
  },
  async run() {
    const envToken = process.env.TIMR_TOKEN;
    const envClientId = process.env.TIMR_CLIENT_ID;
    const envClientSecret = process.env.TIMR_CLIENT_SECRET;

    if (envToken) {
      consola.success("Authenticated via $TIMR_TOKEN (static bearer token).");
      return;
    }
    if (envClientId && envClientSecret) {
      consola.success("Authenticated via $TIMR_CLIENT_ID + $TIMR_CLIENT_SECRET.");
      consola.info(`client_id: ${envClientId}`);
      return;
    }

    const stored = await loadCredentials();
    if (!stored) {
      consola.warn("Not authenticated. Run `timr auth login`.");
      process.exit(2);
    }

    const mode = await credentialsFileMode();
    consola.success(`Authenticated via stored credentials (${CREDENTIALS_FILE}).`);
    consola.info(`client_id: ${stored.clientId}`);
    consola.info(`token_url: ${stored.tokenUrl ?? DEFAULT_TOKEN_URL}`);
    consola.info(`scope:     ${stored.scope ?? DEFAULT_SCOPE}`);
    if (stored.baseUrl) consola.info(`base_url:  ${stored.baseUrl}`);
    consola.info(`saved_at:  ${stored.savedAt}`);
    if (mode && mode !== "600") {
      consola.warn(
        `File mode is ${mode}, expected 600. Run: chmod 600 ${CREDENTIALS_FILE}`,
      );
    }

    consola.start("Testing credentials...");
    const provider = createOAuthTokenProvider({
      clientId: stored.clientId,
      clientSecret: stored.clientSecret,
      tokenUrl: stored.tokenUrl,
      scope: stored.scope,
    });
    try {
      await provider();
      consola.success("Token exchange works.");
    } catch (err) {
      consola.error(
        `Token exchange failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      process.exit(1);
    }
  },
});

export const authCommand = defineCommand({
  meta: {
    name: "auth",
    description: "Manage timr authentication credentials",
  },
  subCommands: { login, logout, status },
});
