import { defineCommand } from "citty";
import { globalArgs, printJson, resolveClient } from "../context.js";

const list = defineCommand({
  meta: { name: "list", description: "List users" },
  args: {
    ...globalArgs,
    name: { type: "string", description: "Filter by name (substring)" },
    resigned: { type: "boolean", description: "Include resigned users" },
    limit: { type: "string", default: "100" },
  },
  async run({ args }) {
    const client = resolveClient(args);
    const { data } = await client.GET("/users", {
      params: {
        query: {
          name: args.name,
          resigned: args.resigned,
          limit: Number(args.limit),
        },
      },
    });
    printJson(data);
  },
});

export const usersCommand = defineCommand({
  meta: { name: "users", description: "Manage users" },
  subCommands: { list },
});
