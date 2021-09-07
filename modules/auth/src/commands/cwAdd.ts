import chalk from "chalk";

import { mc, hex } from "@spookelton/wrapperHelpers/colors";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const cwAdd: Command = async (message) => {
	return {};
	// // ~commandwhitelist add !list @Inrix 1 hour
	// // ~commandwhitelist remove !list @Inrix 1 hour
	// let whitelisted_object;
	// if (message.mentions.users[0].id) {
	// 	mS.whitelisted_discord_users[message.mentions.users[0].id] = {};
	// 	whitelisted_object = mS.whitelisted_discord_users[message.mentions.users[0].id];
	// 	whitelisted_object.Username = message.mentions.users[0].username;
	// } else if (message.mentions.roles[0].id) {
	// 	mS.whitelisted_discord_roles[message.mentions.roles[0].id] = {};
	// 	whitelisted_object = mS.whitelisted_discord_roles[message.mentions.roles[0].id];
	// 	whitelisted_object.Name = message.mentions.roles[0].name;
	// }
	// if (!whitelisted_object.allowAllCommands) whitelisted_object.allowAllCommands = false;
	// if (!whitelisted_object.allowedCommands) whitelisted_object.allowedCommands = {};
	// let expiresin = message.args[3] ? new moment().add(message.args[3], message.args[4]) : false;
	// whitelisted_object.allowedCommands[message.args[1].toLowerCase()] = {
	// 	assignedAt: new Date(),
	// 	assignedBy: {
	// 		Username: message.author.username,
	// 		discord_id: message.author.id,
	// 	},
	// 	expiresAt: expiresin, // If the user specifies a expiery time set it, otherwise use infinite
	// 	expired: false,
	// };
	// await modul.saveSettings(sS, mS);
	// return { wo: whitelisted_object, expiresin: expiresin };
	// // cwAdd: function(vars) {
	// // 	console.log(vars)
	// // 	return [{
	// // 		discord : {
	// // 			string: null,
	// // 			embed: {
	// // 				color: parseInt(sS.c[sS.modules['command'].discordColor||sS.modules['command'].color].h, 16),
	// // 				title: `Whitelisted command ${vars.args[1]} for @${(vars.cr.wo.Username) ? vars.cr.wo.Username : vars.cr.wo.Name}`,
	// // 				description: `Expires in ${moment(vars.cr.expiresin).fromNow(true)}`,
	// // 				timestamp: new Date(),
	// // 				footer: {
	// // 					text: `Executed in ${util.getDuration(message.exeStart, new Date())}`
	// // 				}
	// // 			}
	// // 		},
	// // 		console: `Whitelisted command ${sS.c['cyan'].c}${vars.args[1]}${sS.c['reset'].c} for ${sS.c['brightBlue'].c}${(vars.cr.wo.Username) ? vars.cr.wo.Username : vars.cr.wo.Name}${sS.c['reset'].c} ${sS.c['yellow'].c}${(vars.args[3]) ? `Expires in ${moment(vars.cr.expiresin).fromNow(true)}` : ''}${sS.c['reset'].c}`
	// // 	}]
	// // }
};
cwAdd.help = {
	summary: "Adds given whitelisted command to a discord role or user.\nFor a specific time if given, otherwise infinite.",
	console: chalk`{white Adds given whitelisted command to a discord role or user.}\nExamples [Discord Only]:\n{yellow ~cwAdd} {blueBright ~listmodules} ${chalk.keyword(
		"orange"
	)("@DiscordUser")} {cyan 1 hour}\n{yellow ~cwAdd} {blueBright !forge tps} ${chalk.keyword("orange")(
		"@DiscordUser"
	)}\n{yellow ~cwAdd} {blueBright !tp} ${chalk.keyword("orange")("@DiscordRole")} {cyan 5.2 minutes}\n{yellow ~cwAdd} {blueBright ~getSpawn} ${chalk.keyword(
		"orange"
	)("@DiscordRole")}`,
	minecraft: [
		{
			text: `Adds given whitelisted command to a discord role or user. For a specific time if given, otherwise infinite.\n`,
			color: mc.whiteBright,
		},
		{
			text: `Examples [Discord Only]:\n`,
			color: mc.white,
		},
		{
			text: `~cwAdd `,
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
			text: `~cwAdd `,
			color: mc.yellow,
		},
		{
			text: `"!forge tps" `,
			color: mc.blueBright,
		},
		{
			text: `@DiscordUser\n`,
			color: mc.redBright,
		},
		{
			text: `~cwAdd `,
			color: mc.yellow,
		},
		{
			text: `!tp `,
			color: mc.blueBright,
		},
		{
			text: `@DiscordRole `,
			color: mc.redBright,
		},
		{
			text: `5.2 minutes\n`,
			color: mc.cyan,
		},
		{
			text: `~cwAdd `,
			color: mc.yellow,
		},
		{
			text: `~getSpawn `,
			color: mc.blueBright,
		},
		{
			text: `@DiscordRole `,
			color: mc.redBright,
		},
	],
	discord: {
		title: "Command Whitelist Remove",
		description: "~cwRemove",
		color: parseInt(hex.orange, 16),
		timestamp: new Date(),
		fields: [
			{
				name: "Description",
				value:
					"Adds given whitelisted command to a discord role or user. \nIf a time is specified the user/role will have access to the command for that duration. Otherwise the permission is given with no expiry.",
			},
			{
				name: "Examples [Discord Only]:",
				value: `**~cwAdd** ~listModules @DiscordUser 1 hour\n**~cwAdd** "forge tps" @DiscordUser\n**~cwAdd** !tp @DiscordRole 5.2 minutes\n**~cwAdd** ~getSpawn @DiscordRole`,
			},
		],
	},
};
