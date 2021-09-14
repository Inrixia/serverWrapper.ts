import type { ThreadExports, ThreadModule } from "@inrixia/threads";
import type { Command, CoreExports, ModuleInfo } from "./types";

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

export const patchErr = (err: unknown, message: string) => {
	if (err instanceof Error) {
		err.message = `${message}\n${err.message}`;
		return err;
	}
	return new Error(message);
};

export const prepGetThread = (thread: ThreadModule["thread"]) => {
	return {
		getCore: () => thread.require<CoreExports>("@spookelton/serverWrapper"),
		getThread: async <T extends ThreadExports = {}>(threadName: string) => {
			try {
				return await thread.require<T>(threadName);
			} catch (err) {
				if (err instanceof Error && !err.message.includes(`${threadName} has not been spawned`)) throw err;
			}
		},
	};
};
