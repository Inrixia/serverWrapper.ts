import chalk from "chalk";

import { mc, hex } from "@spookelton/wrapperHelpers/colors";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

import { moduleSettings } from "..";
import { cwParams } from "../lib/cwParams";

export const cwRemove: Command = async (message) => {
	const { provider, command, id, name } = cwParams(message);

	if (moduleSettings[provider][id]?.allowedCommands?.[command] === undefined) throw new Error(`Command ${command} is not whitelisted for ${name}`);

	delete moduleSettings[provider][id].allowedCommands[command];
	return {
		console: chalk`Removed command {cyanBright ${command}} for {blueBright ${name}}`,
		minecraft: [
			{
				text: "Removed command ",
			},
			{
				text: command,
				color: mc.cyanBright,
			},
			{
				text: " for ",
			},
			{
				text: name,
				color: mc.blueBright,
			},
		],
		discord: {
			color: parseInt(hex.whiteBright, 16),
			title: `Removed command ${command} for ${name}`,
			timestamp: Date.now(),
		},
	};
};
const DiscordUser = chalk.keyword("orange")("@DiscordUser");
const DiscordRole = chalk.keyword("orange")("@DiscordRole");
cwRemove.help = {
	summary: "Removes given whitelisted commands from a role or user.",
	console: chalk`{white Removes given whitelisted commands from a role or user.}\nExamples:\n{yellow ~cw_remove} ~killModule ${DiscordUser}\n{yellow ~cw_remove} !tps ${DiscordRole}\n{yellow ~cw_remove} ~* Minecraft_user1873425\n`,
	minecraft: [
		{
			text: `Removes given whitelisted commands from a role or user.\n`,
			color: mc.whiteBright,
		},
		{
			text: `Examples:\n`,
			color: mc.white,
		},
		{
			text: `~cwRemove `,
			color: mc.yellow,
		},
		{
			text: `~killModule `,
			color: mc.blueBright,
		},
		{
			text: `@DiscordUser\n`,
			color: mc.blueBright,
		},
		{
			text: `~cwRemove `,
			color: mc.yellow,
		},
		{
			text: `!tps `,
			color: mc.blueBright,
		},
		{
			text: `@DiscordRole\n`,
			color: mc.blueBright,
		},
		{
			text: `~cwRemove `,
			color: mc.yellow,
		},
		{
			text: `~* `,
			color: mc.blueBright,
		},
		{
			text: `Minecraft_user1873425`,
			color: mc.blueBright,
		},
	],
	discord: {
		title: "Command Whitelist Remove",
		description: "~cwRemove",
		color: parseInt(hex.orange, 16),
		timestamp: Date.now(),
		fields: [
			{
				name: "Description",
				value: "Removes given whitelisted commands from a discord role or user.",
			},
			{
				name: "Example",
				value: "**~cwRemove** ~killModule @DiscordUser\n**~cwRemove** !tps @DiscordRole\n**~cwRemove** ~* Minecraft_user1873425",
			},
		],
	},
};
