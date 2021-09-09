import type { Command, ModuleInfo } from "./types";

export * from "./lib";

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

export const setTitleBar = (string: string) => process.stdout.write(`${String.fromCharCode(27)}]0;${string}${String.fromCharCode(7)}`);
