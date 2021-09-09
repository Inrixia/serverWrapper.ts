import WrapperModule from "../lib/WrapperModule";
import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const restartModules: Command = async () => {
	await Promise.all(WrapperModule.enabledModules().map((module) => module.restart()));
	return strOut([["Restarted all modules ", "cyan"]], "cyan");
};
restartModules.help = helpHelper({
	commandString: "~restartModules",
	summary: "Restarts all modules.",
});
