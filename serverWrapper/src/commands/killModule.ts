import chalk from "chalk";

import WrapperModule from "../lib/WrapperModule";
import { mc, hex } from "@spookelton/wrapperHelpers/colors";
import { helpHelper } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const killModule: Command = async (message) => {
	const moduleName = message.args[0];
	if (moduleName === undefined) throw new Error("No module specified.");
	const moduleToKill = WrapperModule.loadedModules[moduleName];
	if (moduleToKill === undefined) throw new Error(`Module ${moduleName} is not loaded. Loaded modules: ${Object.keys(WrapperModule.loadModules).join(" ")}`);
	await moduleToKill.kill();
	return {
		console: chalk`{cyanBright Killed module}: {${moduleToKill.color} ${moduleName}}`,
		minecraft: [
			{
				text: "Killed module ",
				color: "aqua",
			},
			{
				text: moduleName,
				color: mc[moduleToKill.color],
			},
		],
		discord: {
			color: parseInt(hex[moduleToKill.color], 16),
			title: `Killed module: ${moduleName}`,
			timestamp: Date.now(),
		},
	};
};
killModule.help = helpHelper({
	commandString: "~killModule",
	summary: "Kills any given module.",
	exampleArgs: [["discord"], ["auth"]],
});
