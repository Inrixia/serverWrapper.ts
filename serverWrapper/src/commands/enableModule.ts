import WrapperModule from "../lib/WrapperModule";
import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const enableModule: Command = async (message) => {
	const moduleName = message.args[0];
	if (moduleName === undefined) throw new Error("No module specified.");
	const moduleToEnable = WrapperModule.loadedModules[moduleName];
	if (moduleToEnable === undefined) throw new Error(`Module ${moduleName} is not loaded. Loaded modules: ${Object.keys(WrapperModule.loadModules).join(" ")}`);
	moduleToEnable.enabled = true;
	return strOut(
		[
			["Enabled module ", "cyan"],
			[moduleName, moduleToEnable.color],
		],
		moduleToEnable.color
	);
};
enableModule.help = helpHelper({
	commandString: "~enableModule",
	summary: "Enables any given module.",
	exampleArgs: [["discord"], ["auth"]],
});
