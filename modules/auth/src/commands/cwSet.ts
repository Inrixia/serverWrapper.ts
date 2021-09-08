import chalk from "chalk";

import { mc, hex } from "@spookelton/wrapperHelpers/colors";
import { helpHelper } from "@spookelton/wrapperHelpers/modul";

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
cwSet.help = helpHelper({
	commandString: "~cwSet",
	summary: "Whitelists given command for a Role or User",
	exampleArgs: [
		["~listmodules", ["@DiscordUser", "redBright"], ["1 hour", "cyan"]],
		["!forge tps", ["@DiscordRole", "redBright"]],
		["!*", ["Minecraft_user1873425", "redBright"], "5.2 minutes"],
	],
});
