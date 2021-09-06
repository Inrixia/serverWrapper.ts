import chalk from "chalk";

import WrapperModule from "../lib/WrapperModule";
import { mc, hex } from "@spookelton/wrapperHelpers/colors";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const enableModule: Command = async (message) => {
	const moduleName = message.args[0];
	if (moduleName === undefined) throw new Error("No module specified.");
	const moduleToEnable = WrapperModule.loadedModules[moduleName];
	if (moduleToEnable === undefined) throw new Error(`Module ${moduleToEnable} is not loaded.`);
	await moduleToEnable.enable();
	return {
		console: chalk`{cyanBright Enabled module}: {${moduleToEnable.config.color} ${moduleName}}`,
		minecraft: [
			{
				text: "Enabled module ",
				color: "aqua",
			},
			{
				text: moduleName,
				color: mc[moduleToEnable.config.color],
			},
		],
		discord: {
			color: parseInt(hex[moduleToEnable.config.color], 16),
			title: `Enabled module: ${moduleName}`,
			timestamp: Date.now(),
		},
	};
};
enableModule.help = {
	console: chalk`{whiteBright Enables any given module.}\nExample: {yellow ~enableModule} {blueBright discord}`,
	minecraft: [
		{
			text: "Enables any given module.",
			color: "white",
		},
		{
			text: "Example: ",
			color: "gray",
		},
		{
			text: "~enableModule discord",
			color: "gold",
		},
	],
	discord: {
		title: "Enable Module",
		description: "~enableModule",
		color: parseInt("e77c02", 16), // redBright
		timestamp: Date.now(),
		fields: [
			{
				name: "Description",
				value: "Enables any given module.",
			},
			{
				name: "Example",
				value: "**~enableModule** discord",
			},
		],
	},
};
