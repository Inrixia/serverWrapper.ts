import WrapperModule from "../lib/WrapperModule";
import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const disableModule: Command = async (message) => {
	const moduleName = message.args[0];
	if (moduleName === undefined) throw new Error("No module specified.");
	const moduleToDisable = WrapperModule.loadedModules[moduleName];
	if (moduleToDisable === undefined) throw new Error(`Module ${moduleName} is not loaded. Loaded modules: ${Object.keys(WrapperModule.loadModules).join(" ")}`);
	moduleToDisable.enabled = false;
	return strOut(
		[
			["Disabled module ", "cyan"],
			[moduleName, moduleToDisable.color],
		],
		moduleToDisable.color
	);
};
disableModule.help = helpHelper({
	commandString: "~disableModule",
	summary: "Disables any given module.",
	exampleArgs: [["discord"], ["auth"]],
});
