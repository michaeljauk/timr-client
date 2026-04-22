import { homedir } from "node:os";
import { join } from "node:path";
import { readFile } from "node:fs/promises";

export const CONFIG_DIR = join(homedir(), ".config", "timr-cli");
export const CREDENTIALS_FILE = join(CONFIG_DIR, "credentials.json");

export interface StoredCredentials {
  clientId: string;
  clientSecret: string;
  tokenUrl?: string;
  scope?: string;
  baseUrl?: string;
  savedAt: string;
}

export async function loadCredentials(): Promise<StoredCredentials | null> {
  try {
    const raw = await readFile(CREDENTIALS_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoredCredentials;
    if (!parsed.clientId || !parsed.clientSecret) return null;
    return parsed;
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "ENOENT"
    ) {
      return null;
    }
    throw err;
  }
}
