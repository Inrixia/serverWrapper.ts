import chalk from "chalk";

import WrapperModule from "../lib/WrapperModule";
import { mc, hex } from "@spookelton/wrapperHelpers/colors";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const restartModule: Command = async (message) => {
	const moduleName = message.args[0];
	if (moduleName === undefined) throw new Error("No module specified.");
	const moduleToStart = WrapperModule.loadedModules[moduleName];
	if (moduleToStart === undefined) throw new Error(`Module ${moduleName} is not loaded. Loaded modules: ${Object.keys(WrapperModule.loadModules).join(" ")}`);
	await moduleToStart.restart();
	return {
		console: chalk`{cyanBright Restarted module}: {${moduleToStart.color} ${moduleName}}`,
		minecraft: [
			{
				text: "Restarted module ",
				color: "aqua",
			},
			{
				text: moduleName,
				color: mc[moduleToStart.color],
			},
		],
		discord: {
			color: parseInt(hex[moduleToStart.color], 16),
			title: `Restarted module: ${moduleName}`,
			timestamp: Date.now(),
		},
	};
};
restartModule.help = {
	summary: "Restarts any given module",
	console: chalk`{whiteBright Restarts any given module.}\nExample: {yellow ~restartModule} {blueBright discord}`,
	minecraft: [
		{
			text: "Restarts any given module. ",
			color: "white",
		},
		{
			text: "Example: ",
			color: "gray",
		},
		{
			text: "~restartModule ",
			color: "gold",
		},
		{
			text: "discord",
			color: "blue",
		},
	],
	discord: {
		title: "Restart Module",
		description: "~restartModule",
		color: parseInt(hex.redBright, 16),
		timestamp: Date.now(),
		fields: [
			{
				name: "Description",
				value: "Restarts any given module.",
			},
			{
				name: "Example",
				value: "**~restartModule** discord",
			},
		],
	},
};
