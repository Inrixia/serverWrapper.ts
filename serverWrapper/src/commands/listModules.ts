import chalk from "chalk";

import WrapperModule from "../lib/WrapperModule";
import { mc, hex } from "@spookelton/wrapperHelpers/colors";
import { helpHelper } from "@spookelton/wrapperHelpers/modul";

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

	const moduleKeys = Object.keys(WrapperModule.loadedModules);
	const modulesLength = moduleKeys.length;
	moduleKeys.forEach((moduleName, index) => {
		const module = WrapperModule.loadedModules[moduleName];
		const moduleColor = module.color;
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
				color: module.running ? mc.green : mc.red,
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
		if (module.enabled) {
			aggregate.enabled.minecraft.push(...minecraft);
			aggregate.enabled.console += console;
		} else {
			aggregate.disabled.minecraft.push(...minecraft);
			aggregate.disabled.console += console;
		}
		aggregate.discord.push({
			discord: {
				color: parseInt(hex[moduleColor], 16),
				title: moduleName,
				description: module.description,
				timestamp: Date.now(),
				footer: {
					text: `${module.running ? "Running" : "Stopped"} • ${module.enabled ? "Enabled" : "Disabled"}`,
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
listModules.help = helpHelper({
	commandString: "~listModules",
	summary: "Gets status of all modules currently installed in the wrapper.",
});
