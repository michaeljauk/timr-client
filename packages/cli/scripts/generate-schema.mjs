#!/usr/bin/env node
// Reads openapi.json and emits a human- and agent-readable field reference
// at packages/cli/skills/timr/SCHEMA.md. Regenerated on every spec bump.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..", "..", "..");
const specPath = resolve(repoRoot, "openapi.json");
const outPath = resolve(__dirname, "..", "skills", "timr", "SCHEMA.md");

const spec = JSON.parse(readFileSync(specPath, "utf8"));
const schemas = spec.components?.schemas ?? {};

function resolveRef(ref) {
  const name = ref.replace(/^#\/components\/schemas\//, "");
  return schemas[name];
}

function flatten(schema, seen = new Set()) {
  if (!schema) return { properties: {}, required: [] };
  if (schema.$ref) {
    if (seen.has(schema.$ref)) return { properties: {}, required: [] };
    seen.add(schema.$ref);
    return flatten(resolveRef(schema.$ref), seen);
  }
  if (schema.allOf) {
    const parts = schema.allOf.map((p) => flatten(p, new Set(seen)));
    return {
      properties: Object.assign({}, ...parts.map((p) => p.properties)),
      required: [...new Set(parts.flatMap((p) => p.required))],
    };
  }
  return {
    properties: schema.properties ?? {},
    required: schema.required ?? [],
  };
}

function typeLabel(prop) {
  if (!prop) return "unknown";
  if (prop.$ref) {
    const name = prop.$ref.replace(/^#\/components\/schemas\//, "");
    return `[${name}](#${slug(name)})`;
  }
  if (prop.allOf) {
    const ref = prop.allOf.find((p) => p.$ref);
    if (ref) {
      const name = ref.$ref.replace(/^#\/components\/schemas\//, "");
      const suffix = prop.nullable ? " | null" : "";
      return `[${name}](#${slug(name)})${suffix}`;
    }
  }
  if (prop.type === "array") {
    return `${typeLabel(prop.items)}[]`;
  }
  if (prop.enum) {
    return prop.enum.map((e) => `\`${e}\``).join(" | ");
  }
  const base = prop.type ?? "unknown";
  return prop.nullable ? `${base} | null` : base;
}

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function escapePipe(s) {
  return s.replace(/([\\|])/g, "\\$1");
}

function renderFields(schema) {
  if (schema?.oneOf || schema?.anyOf) {
    const variants = (schema.oneOf ?? schema.anyOf)
      .map((v) => typeLabel(v))
      .join(" or ");
    return `One of: ${escapePipe(variants)}\n`;
  }
  const { properties, required } = flatten(schema);
  const keys = Object.keys(properties);
  if (keys.length === 0) return "_no documented fields_\n";
  const lines = ["| field | type | required |", "|---|---|---|"];
  for (const key of keys) {
    const prop = properties[key];
    const type = escapePipe(typeLabel(prop));
    const req = required.includes(key) ? "yes" : "";
    lines.push(`| \`${key}\` | ${type} | ${req} |`);
  }
  return lines.join("\n") + "\n";
}

function resourceOrder() {
  const listed = new Set();
  const order = [];
  for (const path of Object.keys(spec.paths ?? {})) {
    const first = path.split("/").filter(Boolean)[0];
    if (!first) continue;
    const name = first.split(":")[0];
    if (listed.has(name)) continue;
    listed.add(name);
    order.push(name);
  }
  return order;
}

function listResponseItemSchema(resource) {
  const op = spec.paths?.[`/${resource}`]?.get;
  if (!op) return null;
  const resp = op.responses?.["200"]?.content?.["application/json"]?.schema;
  if (!resp) return null;
  const flat = flatten(resp);
  const dataProp = flat.properties.data;
  if (!dataProp || dataProp.type !== "array" || !dataProp.items) return null;
  const ref = dataProp.items.$ref ?? dataProp.items.allOf?.find((p) => p.$ref)?.$ref;
  if (!ref) return { inline: dataProp.items };
  return { name: ref.replace(/^#\/components\/schemas\//, "") };
}

const out = [];
out.push("# timr API — field reference\n");
out.push(
  `Auto-generated from \`openapi.json\` (timr API **${spec.info?.version ?? "?"}**). Do not hand-edit.\n`,
);
out.push(
  "Every list endpoint returns `{ data: T[], next_page_token: string | null }`. The tables below document `T` for each resource, plus all nested schemas referenced from responses.\n",
);

out.push("## List resources\n");
out.push("| CLI | Endpoint | Item type |");
out.push("|---|---|---|");
for (const resource of resourceOrder()) {
  const op = spec.paths?.[`/${resource}`]?.get;
  if (!op) continue;
  const item = listResponseItemSchema(resource);
  const typeCell = item?.name ? `[${item.name}](#${slug(item.name)})` : "_inline_";
  out.push(`| \`timr ${resource} list\` | \`GET /${resource}\` | ${typeCell} |`);
}
out.push("");

out.push("## Schemas\n");
const schemaNames = Object.keys(schemas).sort();
for (const name of schemaNames) {
  out.push(`### ${name}\n`);
  out.push(renderFields(schemas[name]));
}

writeFileSync(outPath, out.join("\n"), "utf8");
console.log(`wrote ${outPath} (${schemaNames.length} schemas)`);
