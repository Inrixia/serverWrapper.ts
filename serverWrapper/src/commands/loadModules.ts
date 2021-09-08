import chalk from "chalk";

import { wrapperSettings } from "..";
import WrapperModule from "../lib/WrapperModule";
import { hex } from "@spookelton/wrapperHelpers/colors";
import { helpHelper } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const loadModules: Command = async () => {
	await WrapperModule.loadModules(wrapperSettings.modules);
	return {
		console: chalk`{cyanBright Loaded modules...}`,
		minecraft: [
			{
				text: "Loaded modules...",
				color: "aqua",
			},
		],
		discord: {
			color: parseInt(hex.cyan, 16),
			title: "Restarted all modules...",
			timestamp: Date.now(),
		},
	};
};
loadModules.help = helpHelper({
	commandString: "~listModules",
	summary: "Loads modules from wrapperSettings.",
});
