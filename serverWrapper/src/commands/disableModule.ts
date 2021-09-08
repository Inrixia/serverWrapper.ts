import chalk from "chalk";

import WrapperModule from "../lib/WrapperModule";
import { mc, hex } from "@spookelton/wrapperHelpers/colors";
import { helpHelper } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const disableModule: Command = async (message) => {
	const moduleName = message.args[0];
	if (moduleName === undefined) throw new Error("No module specified.");
	const moduleToDisable = WrapperModule.loadedModules[moduleName];
	if (moduleToDisable === undefined) throw new Error(`Module ${moduleName} is not loaded. Loaded modules: ${Object.keys(WrapperModule.loadModules).join(" ")}`);
	moduleToDisable.enabled = false;
	return {
		console: chalk`{cyanBright Disabled module}: {${moduleToDisable.color} ${moduleName}}`,
		minecraft: [
			{
				text: "Disabled module ",
				color: "aqua",
			},
			{
				text: moduleName,
				color: mc[moduleToDisable.color],
			},
		],
		discord: {
			color: parseInt(hex[moduleToDisable.color], 16),
			title: `Disabled module: ${moduleName}`,
			timestamp: Date.now(),
		},
	};
};
disableModule.help = helpHelper({
	commandString: "~disableModule",
	summary: "Disables any given module.",
	exampleArgs: [["discord"], ["auth"]],
});
