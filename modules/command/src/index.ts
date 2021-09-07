// Import command Commands
import * as _commands from "./commands";

// Import command handlers
import { commandHandler, discordHandler, minecraftHandler } from "./lib/commandHandlers";

// Import Types
import type { Command, ModuleInfo, CoreExports } from "@spookelton/wrapperHelpers/types";
import type { ThreadModule, RequiredThread } from "@inrixia/threads";
import type * as DiscordModule from "@spookelton/discord";
import type * as AuthModule from "@spookelton/auth";

export let wrapperCore: RequiredThread<CoreExports>;
export let discordModule: RequiredThread<typeof DiscordModule> | undefined;
export let authModule: RequiredThread<typeof AuthModule> | undefined;

// Thread stuff
const thread = (module.parent as ThreadModule).thread;
thread.on("consoleStdin", commandHandler);
thread.on("serverStdout", minecraftHandler);

import { buildModuleInfo } from "@spookelton/wrapperHelpers/modul";
// Export moduleInfo
export const moduleInfo = buildModuleInfo({
	commands: _commands,
	persistent: true,
	color: "greenBright",
	description: "Handles all commands.",
});

// Expose lib functions
export { lErr, logg } from "./lib";

// Export commands for ./commands/help
export const commands: Record<string, Command & { module: string; moduleInfo: ModuleInfo }> = {};

export const loadModuleCommands = async (moduleInfo: ModuleInfo) => {
	if (moduleInfo.module === undefined || moduleInfo.commands === undefined) return;
	let moduleThread;
	if (moduleInfo.module !== "@spookelton/command") moduleThread = await thread.require<Record<string, Command>>(moduleInfo.module);
	else moduleThread = _commands;
	for (const command in moduleInfo.commands) {
		// @ts-expect-error
		commands[command] = moduleThread[command];
		commands[command].help = moduleInfo.commands[command];
		commands[command].module = moduleInfo.module;
		commands[command].moduleInfo = moduleInfo;
	}
};

export const unloadModuleCommands = async (module: string) => {
	for (const command in commands) if (commands[command].module === module) delete commands[command];
};

(async () => {
	// Load core wrapper commands
	wrapperCore = await thread.require("@spookelton/serverWrapper");
	// Fetch other loaded modules and load their commands
	await Promise.all((await wrapperCore.getRunningModules()).map(loadModuleCommands));

	try {
		discordModule = await thread.require("@spookelton/discord");
		discordModule.on("discordMessage", discordHandler);
	} catch (err) {
		if (err instanceof Error && !err.message.includes("@spookelton/discord has not been spawned")) throw err;
	}
	try {
		authModule = await thread.require("@spookelton/auth");
	} catch (err) {
		if (err instanceof Error && !err.message.includes("@spookelton/auth has not been spawned")) throw err;
	}
})();
