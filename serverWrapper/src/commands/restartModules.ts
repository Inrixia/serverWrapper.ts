import chalk from "chalk";

import { loadedModules, wrapperSettings } from "../";
import WrapperModule from "../lib/WrapperModule";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const restartModules: Command = async () => {
	// Kill all loaded modules
	for (const module of Object.values(loadedModules)) await module.kill();
	// Remove all loaded modules
	for (const key in loadedModules) delete loadedModules[key];
	// Load modules from settings
	for (const moduleName in wrapperSettings.modules) {
		loadedModules[moduleName] = new WrapperModule(wrapperSettings.modules[moduleName]);
	}
	// Start all enabled modules
	for (const module of Object.values(loadedModules)) await module.restart();
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
		color: parseInt("e77c02", 16), // redBright
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
