import chalk from "chalk";

import WrapperModule from "../lib/WrapperModule";
import { mc, hex } from "@spookelton/wrapperHelpers/colors";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const disableModule: Command = async (message) => {
	const moduleName = message.args[0];
	if (moduleName === undefined) throw new Error("No module specified.");
	const moduleToDisable = WrapperModule.loadedModules[message.args[1]];
	if (moduleToDisable === undefined) throw new Error(`Module ${moduleName} is not loaded.`);
	moduleToDisable.enabled = false;
	return {
		console: chalk`{cyanBright Disabled module}: {${moduleToDisable.color} ${moduleName}}`,
		minecraft: [
			{
				text: "Disabled module ",
				color: "aqua",
			},
			{
				text: moduleName,
				color: mc[moduleToDisable.color],
			},
		],
		discord: {
			color: parseInt(hex[moduleToDisable.color], 16),
			title: `Disabled module: ${moduleName}`,
			timestamp: Date.now(),
		},
	};
};
disableModule.help = {
	summary: "Disables any given module.",
	console: chalk`{whiteBright Disables any given module and saves settings if true.}\nExample: {yellow ~disableModule} {blueBright discord} {redBright true}`,
	minecraft: [
		{
			text: "Disables any given module and saves settings if true.\n",
			color: "white",
		},
		{
			text: "Example: ",
			color: "gray",
		},
		{
			text: "~disableModule ",
			color: "gold",
		},
		{
			text: "discord ",
			color: "blue",
		},
		{
			text: "true",
			color: "gold",
		},
	],
	discord: {
		title: "Disable Module",
		description: "~disableModule",
		color: parseInt(hex.redBright, 16),
		timestamp: Date.now(),
		fields: [
			{
				name: "Description",
				value: "Disables any given module. Excepts an optional parameter which if true, saves the updated settings.",
			},
			{
				name: "Example",
				value: "**~disableModule** discord true",
			},
		],
	},
};
