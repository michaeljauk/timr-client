import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { mkdir, readFile, writeFile, chmod, unlink, stat } from "node:fs/promises";

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
    if (isNotFound(err)) return null;
    throw err;
  }
}

export async function saveCredentials(
  creds: Omit<StoredCredentials, "savedAt">,
): Promise<string> {
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  const payload: StoredCredentials = { ...creds, savedAt: new Date().toISOString() };
  await writeFile(CREDENTIALS_FILE, JSON.stringify(payload, null, 2), {
    encoding: "utf8",
    mode: 0o600,
  });
  await chmod(CREDENTIALS_FILE, 0o600).catch(() => undefined);
  return CREDENTIALS_FILE;
}

export async function clearCredentials(): Promise<boolean> {
  try {
    await unlink(CREDENTIALS_FILE);
    return true;
  } catch (err) {
    if (isNotFound(err)) return false;
    throw err;
  }
}

export async function credentialsFileMode(): Promise<string | null> {
  try {
    const s = await stat(CREDENTIALS_FILE);
    return (s.mode & 0o777).toString(8).padStart(3, "0");
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

function isNotFound(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "ENOENT"
  );
}

void dirname;
