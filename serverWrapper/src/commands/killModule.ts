import chalk from "chalk";

import WrapperModule from "../lib/WrapperModule";
import { mc, hex } from "@spookelton/wrapperHelpers/colors";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const killModule: Command = async (message) => {
	const moduleName = message.args[0];
	if (moduleName === undefined) throw new Error("No module specified.");
	const moduleToKill = WrapperModule.loadedModules[moduleName];
	if (moduleToKill === undefined) throw new Error(`Module ${moduleToKill} is not loaded.`);
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
killModule.help = {
	summary: "Stops any given module.",
	console: chalk`{whiteBright Stops any given module.}\nExample: {yellow ~killModule} {blueBright discord}`,
	minecraft: [
		{
			text: "Stops any given module. ",
			color: "white",
		},
		{
			text: "Example: ",
			color: "gray",
		},
		{
			text: "~killModule ",
			color: "gold",
		},
		{
			text: "discord",
			color: "blue",
		},
	],
	discord: {
		title: "Kill Module",
		description: "~killModule",
		color: parseInt("e77c02", 16), // redBright
		timestamp: new Date(),
		fields: [
			{
				name: "Description",
				value: "Stops any given module.",
			},
			{
				name: "Example",
				value: "**~killModule** discord",
			},
		],
	},
};
