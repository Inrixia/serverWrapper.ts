// Import command Commands
import * as _commands from "./commands";

// Import Types
import type { Command, LogTo, Output, ModuleInfo } from "@spookelton/wrapperHelpers/types";
import type { ThreadModule, RequiredThread } from "@inrixia/threads";

// Thread stuff
const thread = (module.parent as ThreadModule).thread;

import type * as serverWrapper from "@spookelton/serverWrapper";
let wrapperCore: RequiredThread<typeof serverWrapper>;

import { commandHandler } from "./lib/commandHandler";
thread.on("consoleStdin", commandHandler);

import { buildModuleInfo } from "@spookelton/wrapperHelpers/modul";
// Export moduleInfo
export const moduleInfo = buildModuleInfo({
	commands: _commands,
	persistent: true,
	color: "greenBright",
	description: "Handles all commands.",
});

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
})();

export const logg = async (output: Output, logTo?: LogTo) => {
	if (output.console !== undefined) console.log(output.console);
	if (output.minecraft !== undefined && logTo?.minecraft !== undefined) {
		if (typeof output.minecraft === "string") await wrapperCore.serverStdin(output.minecraft);
		else await wrapperCore.serverStdin(`tellraw ${logTo.minecraft} ${JSON.stringify(output.minecraft)}`);
	}
	// if (output.discord) logTo.discord.send(output.discord);
};

export const lErr = async (err: Error, logTo?: LogTo, message?: string) =>
	await logg(
		{
			console: `${message}\n${err.message}\n${err.stack}`,
			minecraft: [
				{
					text: `${message}\n`,
					color: "red",
				},
				{
					text: `${err.message}\n${err.stack}`,
					color: "white",
				},
			],
			discord: {
				color: parseInt("800000", 16),
				title: `${message} • ${err.message}`,
				description: err.stack,
				timestamp: new Date(),
			},
		},
		logTo
	).catch((err) =>
		console.log(`\u001b[91;1mError logging Error! Look... Shits real fucked if you're this deep in errors\u001b[0m ${err.message}\n${err.stack}`)
	);
