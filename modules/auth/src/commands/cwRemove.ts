import chalk from "chalk";

import { mc, hex } from "@spookelton/wrapperHelpers/colors";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

import { moduleSettings } from "..";
import { cwParams } from "../lib/cwParams";
import { helpHelper } from "@spookelton/wrapperHelpers/modul";

export const cwRemove: Command = async (message) => {
	const { provider, command, id, name } = cwParams(message);

	if (moduleSettings[provider][id]?.allowedCommands?.[command] === undefined) throw new Error(`Command ${command} is not whitelisted for ${name}`);

	// @ts-expect-error In order for the delete to show in settings have to set to undefined
	moduleSettings[provider][id].allowedCommands[command] = undefined;
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
cwRemove.help = helpHelper({
	commandString: "~cwRemove",
	summary: "Removes given whitelisted commands from a role or user.",
	exampleArgs: [
		["~killModule", ["@DiscordUser", "redBright"]],
		["!tps", ["@DiscordRole", "redBright"]],
		["~*", ["Minecraft_user1873425", "redBright"]],
	],
});
