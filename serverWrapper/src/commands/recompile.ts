import { execSync } from "child_process";
import WrapperModule from "../lib/WrapperModule";
import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const recompile: Command = async () => {
	execSync("npm run tsc");
	await Promise.all(WrapperModule.enabledModules().map((module) => module.restart()));
	return strOut([["Recompiled wrapper & restarted modules", "cyan"]], "cyan");
};
recompile.help = helpHelper({
	commandString: "~recompile",
	summary: "Recompiles wrapper and restarts all modules.\nWarning DEV only, may not work outside of dev environment.",
});
