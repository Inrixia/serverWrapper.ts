import WrapperModule from "../lib/WrapperModule";
import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const restartModule: Command = async (message) => {
	const moduleName = message.args[0];
	if (moduleName === undefined) throw new Error("No module specified.");
	const moduleToRestart = WrapperModule.loadedModules[moduleName];
	if (moduleToRestart === undefined) throw new Error(`Module ${moduleName} is not loaded. Loaded modules: ${Object.keys(WrapperModule.loadModules).join(" ")}`);
	await moduleToRestart.restart();
	return strOut(
		[
			["Restarted module ", "cyan"],
			[moduleName, moduleToRestart.color],
		],
		moduleToRestart.color
	);
};
restartModule.help = helpHelper({
	commandString: "~restartModule",
	summary: "Restarts any given module.",
	exampleArgs: [["discord"], ["auth"]],
});
