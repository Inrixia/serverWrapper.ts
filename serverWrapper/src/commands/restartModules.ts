import chalk from "chalk";

import WrapperModule from "../lib/WrapperModule";
import { helpHelper } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";
import { hex } from "@spookelton/wrapperHelpers/colors";

export const restartModules: Command = async () => {
	await Promise.all(WrapperModule.enabledModules().map((module) => module.restart()));
	return {
		console: chalk`{cyanBright Restarted all modules...}`,
		minecraft: [
			{
				text: "Restarted all modules...",
				color: "aqua",
			},
		],
		discord: {
			color: parseInt("00ffff", 16),
			title: "Restarted all modules...",
			timestamp: Date.now(),
		},
	};
};
restartModules.help = helpHelper({
	commandString: "~restartModules",
	summary: "Restarts all modules.",
});
