import chalk from "chalk";

import WrapperModule from "../lib/WrapperModule";
import { mc, hex } from "@spookelton/wrapperHelpers/colors";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const startModule: Command = async (message) => {
	const moduleName = message.args[0];
	if (moduleName === undefined) throw new Error("No module specified.");
	const moduleToStart = WrapperModule.loadedModules[moduleName];
	if (moduleToStart === undefined) throw new Error(`Module ${moduleToStart} is not loaded.`);
	await moduleToStart.start();
	return {
		console: chalk`{cyanBright Started module}: {${moduleToStart.config.color} ${moduleName}}`,
		minecraft: [
			{
				text: "Started module ",
				color: "aqua",
			},
			{
				text: moduleName,
				color: mc[moduleToStart.config.color],
			},
		],
		discord: {
			color: parseInt(hex[moduleToStart.config.color], 16),
			title: `Started module: ${moduleName}`,
			timestamp: Date.now(),
		},
	};
};
startModule.help = {
	console: chalk`{whiteBright Starts any given module.}\nExample: {yellow ~startModule} {blueBright discord}`,
	minecraft: [
		{
			text: "Starts any given module. ",
			color: "white",
		},
		{
			text: "Example: ",
			color: "gray",
		},
		{
			text: "~startModule ",
			color: "gold",
		},
		{
			text: "discord",
			color: "blue",
		},
	],
	discord: {
		title: "Start Module",
		description: "~startModule",
		color: parseInt("e77c02", 16), // redBright
		timestamp: Date.now(),
		fields: [
			{
				name: "Description",
				value: "Starts any given module.",
			},
			{
				name: "Example",
				value: "**~startModule** discord",
			},
		],
	},
};
