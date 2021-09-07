import chalk from "chalk";

import { mc, hex } from "@spookelton/wrapperHelpers/colors";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

import { moduleSettings } from "..";
import { cwParams } from "../lib/cwParams";

export const cwSet: Command = async (message) => {
	const { provider, command, id, name, expiresAt } = cwParams(message);

	moduleSettings[provider][id] ??= {
		name,
		allowedCommands: {},
	};

	moduleSettings[provider][id].allowedCommands[command] = {
		assignedAt: Date.now(),
		assignedBy: {
			name,
			id,
		},
	};

	if (expiresAt) moduleSettings[provider][id].allowedCommands[command].expiresAt = expiresAt;

	return {
		console: chalk`Whitelisted command {cyanBright ${command}} for {blueBright ${name}}`,
		minecraft: [
			{
				text: "Whitelisted command ",
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
			title: `Whitelisted command ${command} for ${name}`,
			timestamp: Date.now(),
		},
	};
};
const DiscordUser = chalk.keyword("orange")("@DiscordUser");
const DiscordRole = chalk.keyword("orange")("@DiscordRole");
cwSet.help = {
	summary: "Whitelists given command for a Role or User.\nFor a specific time if given, otherwise infinite.",
	console: chalk`{white Whitelists given command for a Role or User.}\nExamples:\n{yellow ~cwSet} {blueBright ~listmodules} ${DiscordUser} {cyan 1 hour}\n{yellow ~cwSet} {blueBright !forge tps} ${DiscordRole}\n{yellow ~cwSet} {blueBright !*} Minecraft_user1873425 {cyan 5.2 minutes}`,
	minecraft: [
		{
			text: `Whitelists given command for a Role or User. For a specific time if given, otherwise infinite.\n`,
			color: mc.whiteBright,
		},
		{
			text: `Examples:\n`,
			color: mc.white,
		},
		{
			text: `~cwSet `,
			color: mc.yellow,
		},
		{
			text: `~listmodules `,
			color: mc.blueBright,
		},
		{
			text: `@DiscordUser `,
			color: mc.redBright,
		},
		{
			text: `1 hour\n`,
			color: mc.cyan,
		},
		{
			text: `~cwSet `,
			color: mc.yellow,
		},
		{
			text: `"!forge tps" `,
			color: mc.blueBright,
		},
		{
			text: `@DiscordRole\n`,
			color: mc.redBright,
		},
		{
			text: `~cwSet `,
			color: mc.yellow,
		},
		{
			text: `!* `,
			color: mc.blueBright,
		},
		{
			text: `Minecraft_user1873425 `,
			color: mc.redBright,
		},
		{
			text: `5.2 minutes\n`,
			color: mc.cyan,
		},
	],
	discord: {
		title: "Command Whitelist Add",
		description: "~cwSet",
		color: parseInt(hex.orange, 16),
		timestamp: new Date(),
		fields: [
			{
				name: "Description",
				value:
					"Whitelists given command for a Role or User. \nIf a time is specified the user/role will have access to the command for that duration. Otherwise the permission is given with no expiry.",
			},
			{
				name: "Examples:",
				value: `**~cwSet** ~listModules @DiscordUser 1 hour\n**~cwSet** "forge tps" @DiscordRole\n**~cwSet** !* Minecraft_user1873425 5.2 minutes`,
			},
		],
	},
};
