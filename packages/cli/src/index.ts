import { defineCommand, runMain } from "citty";
import { projectTimesCommand } from "./commands/project-times.js";
import { tasksCommand } from "./commands/tasks.js";
import { usersCommand } from "./commands/users.js";

const main = defineCommand({
  meta: {
    name: "timr",
    version: "0.1.0",
    description: "Community CLI for the timr time-tracking API",
  },
  subCommands: {
    "project-times": projectTimesCommand,
    tasks: tasksCommand,
    users: usersCommand,
  },
});

runMain(main);
