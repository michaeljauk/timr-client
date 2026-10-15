import { defineCommand, runMain, showUsage } from "citty";
import { authCommand } from "./commands/auth.js";
import { generatedSubCommands } from "./commands/generated/_root.js";

declare const __PKG_VERSION__: string;

const main = defineCommand({
  meta: {
    name: "timr",
    version: __PKG_VERSION__,
    description: "Community CLI for the timr time-tracking API",
  },
  subCommands: {
    auth: authCommand,
    ...generatedSubCommands,
  },
  run: ({ cmd }) => showUsage(cmd),
});

runMain(main);
