import * as commands from "./commands";
export * from "./commands";

import db from "@inrixia/db";

import { buildModuleInfo } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { ModuleSettings } from "./types";

// Export moduleInfo
export const moduleInfo = buildModuleInfo({
	commands,
	persistent: true,
	color: "white",
	description: "Handles all permissions.",
});

export const moduleSettings = db<ModuleSettings>("./_db/auth.json", {
	forceCreate: true,
	updateOnExternalChanges: true,
	pretty: true,
	template: {
		discord: {
			roles: {},
			users: {},
		},
	},
});

// async function checkCommandAuth(allowedCommands, message) {
// 	for (command in allowedCommands) {
// 		if (
// 			!allowedCommands[command.toLowerCase()].expired &&
// 			(allowedCommands[command.toLowerCase()].expiresAt === false || new Date(allowedCommands[command.toLowerCase()].expiresAt) > new Date())
// 		) {
// 			// If permission has not expired
// 			if (command == "*") return true;
// 			else if (command == "!*" && message.string.slice(0, 1) == "!") return true;
// 			else if (command == "~*" && message.string.slice(0, 1) == "~") return true;
// 			if (message.string.slice(0, command.length) == command) return true; // If the command beginning matches return true
// 		} else {
// 			if (allowedCommands[command.toLowerCase()].expired && message.string.slice(0, command.length) == command)
// 				throw new Error("Allowed use of this command has expired.");
// 			if (!allowedCommands[command.toLowerCase()].expired) {
// 				allowedCommands[command.toLowerCase()].expired = true;
// 				await modul.saveSettings(sS, mS);
// 			}
// 		}
// 	}
// 	if (!authErr) throw new Error("User not allowed to run this command.");
// }

// async function checkDiscordAuth(message) {
// 	if (mS.whitelisted_discord_users[message.author.id]) {
// 		// If user matches a whitelisted user
// 		let whitelisted_user = mS.whitelisted_discord_users[message.author.id];
// 		if (whitelisted_user["Username"] != message.author.username) {
// 			whitelisted_user["Username"] = message.author.username;
// 			modul.saveSettings(sS, mS);
// 		}
// 		if (await checkCommandAuth(whitelisted_user.allowedCommands, message)) return true;
// 	}
// 	for (role_index in message.member.roles) {
// 		discord_role = message.member.roles[role_index];
// 		if (discord_role.id in mS.whitelisted_discord_roles) {
// 			// If user has a whitelisted role
// 			let whitelisted_role = mS.whitelisted_discord_roles[discord_role.id];
// 			if (whitelisted_role["Name"] != discord_role.name) {
// 				whitelisted_role["Name"] = discord_role.name;
// 				modul.saveSettings(sS, mS);
// 			}
// 			if (await checkCommandAuth(whitelisted_role.allowedCommands, message)) return true;
// 		}
// 	}
// 	if (!authErr) throw new Error("User not whitelisted.");
// }
