import chalk from "chalk";

import { wrapperSettings } from "..";
import WrapperModule from "../lib/WrapperModule";
import { hex } from "@spookelton/wrapperHelpers/colors";

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
loadModules.help = {
	summary: "Loads modules from wrapperSettings",
	console: chalk`{whiteBright Loads modules from wrapperSettings.}\nExample: {yellow ~loadModules}`,
	minecraft: [
		{
			text: "Loads modules from wrapperSettings. ",
			color: "white",
		},
		{
			text: "Example: ",
			color: "gray",
		},
		{
			text: "~loadModules",
			color: "gold",
		},
	],
	discord: {
		title: "Restart All Modules",
		description: "~loadModules",
		color: parseInt(hex.redBright, 16),
		timestamp: Date.now(),
		fields: [
			{
				name: "Description",
				value: "Loads modules from wrapperSettings.",
			},
			{
				name: "Example",
				value: "**~loadModules**",
			},
		],
	},
};
