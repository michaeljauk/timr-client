import { defineCommand, runMain } from "citty";
import { authCommand } from "./commands/auth.js";
import { generatedSubCommands } from "./commands/generated/_root.js";

declare const __PKG_VERSION__: string;

// No root `run`: citty calls a parent's run after every subcommand, which
// would append the usage text to each command's JSON output.
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
});

runMain(main);
