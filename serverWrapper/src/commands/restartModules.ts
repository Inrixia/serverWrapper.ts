import chalk from "chalk";

import { wrapperSettings } from "../";
import WrapperModule from "../lib/WrapperModule";

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
restartModules.help = {
	summary: "Restarts all modules",
	console: chalk`{whiteBright Restarts all modules.}\nExample: {yellow ~restartModules}`,
	minecraft: [
		{
			text: "Restarts all modules. ",
			color: "white",
		},
		{
			text: "Example: ",
			color: "gray",
		},
		{
			text: "~restartModules",
			color: "gold",
		},
	],
	discord: {
		title: "Restart All Modules",
		description: "~restartModules",
		color: parseInt(hex.redBright, 16),
		timestamp: Date.now(),
		fields: [
			{
				name: "Description",
				value: "Restarts all modules.",
			},
			{
				name: "Example",
				value: "**~restartModules**",
			},
		],
	},
};
