import { defineCommand, runMain } from "citty";
import { authCommand } from "./commands/auth.js";
import { generatedSubCommands } from "./commands/generated/_root.js";

const main = defineCommand({
  meta: {
    name: "timr",
    version: "0.1.0",
    description: "Community CLI for the timr time-tracking API",
  },
  subCommands: {
    auth: authCommand,
    ...generatedSubCommands,
  },
});

runMain(main);
