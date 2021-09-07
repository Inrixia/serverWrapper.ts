import chalk from "chalk";

import { mc, hex } from "@spookelton/wrapperHelpers/colors";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const cwRemove: Command = async (message) => {
	return {};
	// if (message.args[0] == "~cwRemove") {
	// 	let whitelisted_object = mS.whitelisted_discord_users[message.mentions.users[0].id];
	// 	if (message.mentions.users[0].id) delete mS.whitelisted_discord_users[message.mentions.users[0].id];
	// 	else if (message.mentions.roles[0].id) delete mS.whitelisted_discord_roles[message.mentions.roles[0].id];
	// 	await modul.saveSettings(sS, mS);
	// 	return whitelisted_object;
	// } else {
	// 	let whitelisted_object = mS.whitelisted_discord_users[message.mentions.users[0].id].allowedCommands[message.args[1].toLowerCase()];
	// 	if (message.mentions.users[0].id) delete mS.whitelisted_discord_users[message.mentions.users[0].id].allowedCommands[message.args[1].toLowerCase()];
	// 	else if (message.mentions.roles[0].id) delete mS.whitelisted_discord_roles[message.mentions.roles[0].id].allowedCommands[message.args[1].toLowerCase()];
	// 	await modul.saveSettings(sS, mS);
	// 	return whitelisted_object;
	// }
	// // cwRemove: function(vars) {
	// // 	return [{
	// // 		discord: { string: `Removed all commands from **${(vars.whitelisted_object.Username) ? vars.whitelisted_object.Username : vars.whitelisted_object.Name}**`, embed: null }
	// // 	}]
	// // },
	// // cw_remove: function(vars) {
	// // 	return [{
	// // 		discord: { string: `Removed command **${vars.args[1]}** from **${(vars.whitelisted_object.Username) ? vars.whitelisted_object.Username : vars.whitelisted_object.Name}**`, embed: null }
	// // 	}]
	// // },
};
cwRemove.help = {
	summary: "Removes given whitelisted commands from a discord role or user.",
	console: chalk`{white Removes given whitelisted commands from a discord role or user.}\nExamples:\n{yellow ~cw_remove} ${chalk.keyword("orange")(
		"@DiscordUser"
	)}\n{yellow ~cw_remove} ${chalk.keyword("orange")("@DiscordRole")}`,
	minecraft: [
		{
			text: `Removes given whitelisted commands from a discord role or user.\n`,
			color: mc.whiteBright,
		},
		{
			text: `Examples:\n`,
			color: mc.white,
		},
		{
			text: `~cw_remove `,
			color: mc.yellow,
		},
		{
			text: `@DiscordUser\n`,
			color: mc.blueBright,
		},
		{
			text: `~cw_remove `,
			color: mc.yellow,
		},
		{
			text: `@DiscordUser`,
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
				value: "**~cw_remove** @DiscordUser\n**~cw_remove** @DiscordRole",
			},
		],
	},
};
