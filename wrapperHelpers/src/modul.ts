import type { Command, ModuleInfo } from "./types";

type ModuleInfoOptions = {
	commands?: Record<string, Command>;
} & Omit<ModuleInfo, "commands">;
export const buildModuleInfo = (options: ModuleInfoOptions): ModuleInfo => ({
	...options,
	commands: options.commands
		? Object.entries(options.commands).reduce((commands, [key, command]) => {
				commands[key] = command.help;
				return commands;
		  }, {} as Record<string, Command["help"]>)
		: undefined,
});
