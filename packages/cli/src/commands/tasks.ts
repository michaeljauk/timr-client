import { defineCommand } from "citty";
import { globalArgs, printJson, resolveClient } from "../context.js";

const list = defineCommand({
  meta: { name: "list", description: "List tasks" },
  args: {
    ...globalArgs,
    name: { type: "string", description: "Filter by task name (substring)" },
    "parent-task-id": { type: "string", description: "Parent task id" },
    bookable: { type: "boolean", description: "Only bookable tasks" },
    billable: { type: "boolean", description: "Only billable tasks" },
    limit: { type: "string", default: "100" },
  },
  async run({ args }) {
    const client = resolveClient(args);
    const { data } = await client.GET("/tasks", {
      params: {
        query: {
          name: args.name,
          parent_task_id: args["parent-task-id"],
          bookable: args.bookable,
          billable: args.billable,
          limit: Number(args.limit),
        },
      },
    });
    printJson(data);
  },
});

export const tasksCommand = defineCommand({
  meta: { name: "tasks", description: "Manage tasks" },
  subCommands: { list },
});
