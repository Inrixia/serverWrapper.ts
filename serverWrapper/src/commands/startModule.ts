import WrapperModule from "../lib/WrapperModule";
import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const startModule: Command = async (message) => {
	const moduleName = message.args[0];
	if (moduleName === undefined) throw new Error("No module specified.");
	const moduleToStart = WrapperModule.loadedModules[moduleName];
	if (moduleToStart === undefined) throw new Error(`Module ${moduleName} is not loaded. Loaded modules: ${Object.keys(WrapperModule.loadModules).join(" ")}`);
	await moduleToStart.start();
	return strOut(
		[
			["Started module ", "cyan"],
			[moduleName, moduleToStart.color],
		],
		moduleToStart.color
	);
};
startModule.help = helpHelper({
	commandString: "~startModule",
	summary: "Starts any given module.",
	exampleArgs: [["discord"], ["auth"]],
});
