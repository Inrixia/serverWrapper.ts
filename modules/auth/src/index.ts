import * as commands from "./commands";
export * from "./commands";

import db from "@inrixia/db";

import { buildModuleInfo } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { AllowedCommand, AllowedCommands, ModuleSettings } from "./types";
import type { DiscordMessage } from "@spookelton/discord/types";

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

const hasPermission = (command: AllowedCommand) => {
	if (command === undefined) return false;
	if (command.expiresAt < Date.now()) throw hiddenError("Allowed use of this command has expired.");
	return true;
};
const canUseCommand = (allowedCommands: AllowedCommands, commandString: string) => {
	if (allowedCommands === undefined) return false;
	if (hasPermission(allowedCommands["*"])) return true;
	if (hasPermission(allowedCommands[commandString])) return true;
	if (hasPermission(allowedCommands["!*"])) return true;
	if (hasPermission(allowedCommands["~*"])) return true;
	return false;
};

export const discordUserAllowedCommand = async (commandString: string, author: DiscordMessage["author"]) => {
	if (canUseCommand(moduleSettings.discord.users[author.id]?.allowedCommands, commandString)) return true;
	if (author.roles !== undefined) {
		for (const roleId of author.roles) {
			if (canUseCommand(moduleSettings.discord.roles[roleId]?.allowedCommands, commandString)) return true;
		}
	}
	throw hiddenError("User not allowed to run this command.");
};

const hiddenError = (message: string) => {
	const err = new Error(message);
	err.stack = undefined;
	return err;
};
