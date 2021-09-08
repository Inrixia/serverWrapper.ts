import chalk from "chalk";

import WrapperModule from "../lib/WrapperModule";
import { mc, hex } from "@spookelton/wrapperHelpers/colors";
import { helpHelper } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const enableModule: Command = async (message) => {
	const moduleName = message.args[0];
	if (moduleName === undefined) throw new Error("No module specified.");
	const moduleToEnable = WrapperModule.loadedModules[moduleName];
	if (moduleToEnable === undefined) throw new Error(`Module ${moduleName} is not loaded. Loaded modules: ${Object.keys(WrapperModule.loadModules).join(" ")}`);
	moduleToEnable.enabled = true;
	return {
		console: chalk`{cyanBright Enabled module}: {${moduleToEnable.color} ${moduleName}}`,
		minecraft: [
			{
				text: "Enabled module ",
				color: "aqua",
			},
			{
				text: moduleName,
				color: mc[moduleToEnable.color],
			},
		],
		discord: {
			color: parseInt(hex[moduleToEnable.color], 16),
			title: `Enabled module: ${moduleName}`,
			timestamp: Date.now(),
		},
	};
};
enableModule.help = helpHelper({
	commandString: "~enableModule",
	summary: "Enables any given module.",
	exampleArgs: [["discord"], ["auth"]],
});
