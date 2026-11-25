import { readFileSync } from "node:fs";

const METHODS = ["get", "post", "put", "patch", "delete"];

export function mergeSpec(official, fragment, warn = console.warn) {
  const merged = {
    ...official,
    paths: { ...official.paths },
    components: {
      ...official.components,
      schemas: { ...official.components?.schemas },
    },
  };

  for (const [path, methods] of Object.entries(fragment.paths ?? {})) {
    for (const [method, op] of Object.entries(methods)) {
      if (!METHODS.includes(method)) continue;
      if (official.paths?.[path]?.[method]) {
        warn(
          `warn: undocumented fragment entry ${method.toUpperCase()} ${path} is obsolete: the official spec defines it. Remove it from spec/undocumented.json.`,
        );
        continue;
      }
      merged.paths[path] = { ...merged.paths[path], [method]: op };
    }
  }

  for (const [name, schema] of Object.entries(fragment.components?.schemas ?? {})) {
    if (official.components?.schemas?.[name]) {
      warn(
        `warn: undocumented fragment schema ${name} is obsolete: the official spec defines it. Remove it from spec/undocumented.json.`,
      );
      continue;
    }
    merged.components.schemas[name] = schema;
  }

  return merged;
}

export function loadSpec(officialPath, fragmentPath, warn = console.warn) {
  const official = JSON.parse(readFileSync(officialPath, "utf8"));
  const fragment = JSON.parse(readFileSync(fragmentPath, "utf8"));
  return mergeSpec(official, fragment, warn);
}
