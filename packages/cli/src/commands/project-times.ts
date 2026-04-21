import { defineCommand } from "citty";
import { globalArgs, printJson, resolveClient } from "../context.js";

const list = defineCommand({
  meta: {
    name: "list",
    description: "List project times in a date range",
  },
  args: {
    ...globalArgs,
    "start-from": {
      type: "string",
      description: "Start date lower bound (YYYY-MM-DD)",
    },
    "start-to": {
      type: "string",
      description: "Start date upper bound (YYYY-MM-DD)",
    },
    task: { type: "string", description: "Filter by task id" },
    users: {
      type: "string",
      description: "Comma-separated user ids",
    },
    limit: { type: "string", default: "100" },
  },
  async run({ args }) {
    const client = resolveClient(args);
    const { data } = await client.GET("/project-times", {
      params: {
        query: {
          start_from: args["start-from"],
          start_to: args["start-to"],
          task: args.task,
          users: args.users?.split(","),
          limit: Number(args.limit),
        },
      },
    });
    printJson(data);
  },
});

export const projectTimesCommand = defineCommand({
  meta: {
    name: "project-times",
    description: "Manage project times",
  },
  subCommands: { list },
});
