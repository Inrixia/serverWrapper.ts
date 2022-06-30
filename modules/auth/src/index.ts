import * as commands from "./commands";
export * from "./commands";

import db from "@inrixia/db";

import { buildModuleInfo, prepGetThread } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { AllowedCommand, AllowedCommands, ModuleSettings } from "./types";
import type { DiscordMessage } from "@spookelton/wrapperHelpers/types";
import type * as mineAPI from "@spookelton/mineapi";
import type { ThreadModule } from "@inrixia/threads";

// Thread stuff
export type MineAPIModule = typeof mineAPI;

const thread = (module.parent as ThreadModule).thread;
export const { getCore, getThread } = prepGetThread(thread);


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
		minecraft: {},
		discord: {
			"344286675691896832": {
				name: "Mods",
				allowedCommands: {
					"*": {
						assignedAt: 1631023635304,
						assignedBy: {
							name: "Inrixia",
							id: "155530711326130176",
						},
					},
				},
			},
		},
	},
});

const hasPermission = (command: AllowedCommand) => {
	if (command === undefined) return false;
	if (command.expiresAt !== undefined && command.expiresAt < Date.now()) throw hiddenError("Allowed use of this command has expired.");
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
	if (canUseCommand(moduleSettings.discord[author.id]?.allowedCommands, commandString)) return true;
	if (author.roles !== undefined) {
		for (const roleId of author.roles) {
			if (canUseCommand(moduleSettings.discord[roleId]?.allowedCommands, commandString)) return true;
		}
	}
	throw hiddenError("User not allowed to run this command.");
};

export const minecraftUserAllowedCommand = async (commandString: string, username: string) => {
	const mineAPIThread = await getThread<MineAPIModule>("@spookelton/mineapi");
	if (mineAPIThread === undefined) throw hiddenError("Unable to access the mineapi module.");
	if (canUseCommand(moduleSettings.minecraft[await mineAPIThread.usernameToUUID(username)]?.allowedCommands, commandString)) return true;
	throw hiddenError("User not allowed to run this command.");
};

const hiddenError = (message: string) => {
	const err = new Error(message);
	err.stack = undefined;
	return err;
};
