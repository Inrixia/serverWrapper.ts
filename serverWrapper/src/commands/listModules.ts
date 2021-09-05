import chalk from "chalk";

import { loadedModules } from "../";
import { mc, hex } from "@spookelton/wrapperHelpers/colors";

type ListAggregate = {
	enabled: {
		console: string;
		minecraft: MinecraftOutputArray;
	};
	disabled: {
		console: string;
		minecraft: MinecraftOutputArray;
	};
	discord: Output[];
};

// Import Types
import type { Command, Output, MinecraftOutputArray } from "@spookelton/wrapperHelpers/types";

export const listModules: Command = async () => {
	const aggregate: ListAggregate = {
		enabled: {
			console: "",
			minecraft: [],
		},
		disabled: {
			console: "",
			minecraft: [],
		},
		discord: [],
	};

	const moduleKeys = Object.keys(loadedModules);
	const modulesLength = moduleKeys.length;
	moduleKeys.forEach((moduleName, index) => {
		const module = loadedModules[moduleName];
		const moduleColor = module.config.color;
		const minecraft = [
			{
				text: `\n  ${moduleName} `,
				color: mc[moduleColor],
			},
			{
				text: "[",
				color: "white" as const,
			},
			{
				text: `${module.running ? "R" : "S"}`,
				color: module.running ? mc["green"] : mc["red"],
			},
			{
				text: "]",
				color: "white" as const,
			},
			{
				text: index < modulesLength - 1 ? "\n" : "",
			},
		];
		const console = chalk`{${moduleColor} ${moduleName}} [${module.running ? chalk`{green R}` : chalk`{red S}`}] `;
		if (module.config.enabled) {
			aggregate.enabled.minecraft.push(...minecraft);
			aggregate.enabled.console += console;
		} else {
			aggregate.disabled.minecraft.push(...minecraft);
			aggregate.enabled.console += console;
		}
		aggregate.discord.push({
			discord: {
				color: parseInt(hex[moduleColor], 16),
				title: moduleName,
				description: module.config.description,
				timestamp: Date.now(),
				footer: {
					text: `${module.running ? "Running" : "Stopped"} • ${module.config.enabled ? "Enabled" : "Disabled"}`,
				},
			},
		});
	});
	return [
		{
			minecraft: [{ text: "Enabled: " }, ...aggregate.enabled.minecraft, { text: "Disabled: " }, ...aggregate.disabled.minecraft],
			console:
				chalk`{cyanBright Enabled wrapper modules}: ${aggregate.enabled.console}\n` + chalk`{cyanBright Disabled wrapper modules}: ${aggregate.disabled.console}`,
		},
		...aggregate.discord,
	];
};
listModules.help = {
	console: chalk`{whiteBright Gets status of all modules currently installed.}\nExample: {yellow ~listModules}`,
	minecraft: [
		{
			text: "Gets status of all modules currently insalled. ",
			color: "white",
		},
		{
			text: "Example: ",
			color: "gray",
		},
		{
			text: "~listModules",
			color: "gold",
		},
	],
	discord: {
		title: "List Modules",
		description: "~listModules",
		color: parseInt("e77c02", 16), // redBright
		timestamp: Date.now(),
		fields: [
			{
				name: "Description",
				value: "Gets status of all modules currently installed.",
			},
			{
				name: "Example",
				value: "**~listModules**",
			},
		],
	},
};
