import chalk from "chalk";

import { mc, hex } from "@spookelton/wrapperHelpers/colors";

// Import Types
import type { Command, MinecraftOutputArray, DiscordEmbed, ModuleInfo } from "@spookelton/wrapperHelpers/types";

// Import commands
import { commands } from "../";

export const help: Command = async (message) => {
	const givenCommandName = message.args[1];
	if (givenCommandName !== undefined) return commands[givenCommandName].help;
	const helpSummary: { console: string; minecraft: MinecraftOutputArray; discord: DiscordEmbed } = {
		console: ``,
		minecraft: [],
		discord: {
			title: "serverWrapper Command Info",
			description: "Currently enabled commands.",
			color: parseInt(hex["orange"], 16),
			timestamp: Date.now(),
			fields: [],
		},
	};
	const moduleSummary: Record<string, { minecraft: MinecraftOutputArray; console: string; discord: string; moduleInfo: ModuleInfo }> = {};
	for (const commandName in commands) {
		const command = commands[commandName];
		moduleSummary[command.module] ??= { console: ``, minecraft: [], discord: ``, moduleInfo: command.moduleInfo };

		moduleSummary[command.module].console += chalk`{whiteBright ~${commandName}} ${command.help.summary}\n`;
		moduleSummary[command.module].minecraft.push(
			{
				text: `~${commandName} `,
				color: mc.whiteBright,
			},
			{
				text: `${command.help.summary}\n`,
				color: mc.white,
			}
		);
		moduleSummary[command.module].discord += `**~${commandName}** ${command.help.summary}\n`;
	}
	for (const module in moduleSummary) {
		helpSummary.console += chalk`{${moduleSummary[module].moduleInfo.color} ${module}} • {whiteBright ${moduleSummary[module].moduleInfo.description}}\n${moduleSummary[module].console}`;
		helpSummary.minecraft.push(
			...[
				...moduleSummary[module].minecraft,
				{
					text: `\n\n${module}`,
					color: mc[moduleSummary[module].moduleInfo.color],
				},
				{
					text: ` • `,
				},
				{
					text: `${moduleSummary[module].moduleInfo.description}`,
					color: mc.whiteBright,
				},
			]
		);
		helpSummary.discord.fields!.push({
			name: `${module} • ${moduleSummary[module].moduleInfo.description}`,
			value: moduleSummary[module].discord,
		});
	}
	return helpSummary;
};
help.help = {
	summary: "Displays all commands or gives info on a specific given command.",
	console: chalk`{whiteBright Returns all commands or gives info on a specific command given.}\nExamples: {yellow ~help} {blueBright listmodules}\n{yellow ?}{blueBright listmodules}`,
	minecraft: [
		{
			text: `Returns all commands or gives info on a specific command given. `,
			color: mc.whiteBright,
		},
		{
			text: `Examples: \n`,
			color: mc.white,
		},
		{
			text: `~help `,
			color: mc.yellow,
		},
		{
			text: `listmodules\n`,
			color: mc.blueBright,
		},
		{
			text: `?`,
			color: mc.yellow,
		},
		{
			text: `listmodules`,
			color: mc.blueBright,
		},
	],
	discord: {
		title: "Help! I have fallen and cant get up.",
		description: "~help",
		color: parseInt(hex["orange"], 16),
		timestamp: new Date(),
		fields: [
			{
				name: "Description",
				value: "Returns all commands or gives info on a specific command given.",
			},
			{
				name: "Examples",
				value: "**~help** listmodules\n**?**listmodules",
			},
		],
	},
};