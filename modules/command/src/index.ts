// Core imports
import chalk from "chalk";
import { mc, hex } from "@spookelton/wrapperHelpers/colors";

// Import core wrapper
import type * as serverWrapper from "@spookelton/serverWrapper";
import * as coreCommands from "@spookelton/serverWrapper/commands";

// Import Types
import type { Command, LogTo, Output } from "@spookelton/wrapperHelpers/types";
import type { ThreadModule, RequiredThread } from "@inrixia/threads";

const thread = (module.parent as ThreadModule).thread;

let wrapperCore: RequiredThread<typeof serverWrapper>;

const commands: Record<string, Command> = {};
(async () => {
	// Load core wrapper commands
	wrapperCore = await thread.require("@spookelton/serverWrapper");
	for (const command in commands) {
		commands[command] = wrapperCore[command as keyof typeof wrapperCore];
		commands[command].help = coreCommands[command as keyof typeof coreCommands].help;
	}
	// Fetch other loaded modules and load their commands
	for (const module of (await wrapperCore.getLoadedModules()).filter((module) => module !== "@spookelton/command")) {
		console.log(module);
		// const module = await thread.require<Record<string, Command>>(module);
		// commands.push(Object.keys(require(`${module}/commands`)));
	}
})();

export const commandHandler = async (string: string, logTo?: LogTo): Promise<void> => {
	string = string.replace(/\s\s+/g, " ").replace("\r", ""); // Compact multiple spaces/tabs down to one
	if (string[0] !== "~" && string[0] !== "?") return; // If the first character isn't a command, ignore it

	// Generate array of args grouping by spaces and quotes
	const [commandName, ...args] = string
		.slice(1)
		.split(' "')
		.flatMap((arg) => (arg.includes('"') ? arg.replace('"', "") : arg.split(" ")));

	const command = commands[commandName];
	if (command === undefined) {
		await logg(
			{
				console: chalk`The command "{redBright ${string}}" could not be matched to a known command...`,
				minecraft: [
					{
						text: 'The command "',
						color: "white",
					},
					{
						text: string,
						color: mc["redBright"],
					},
					{
						text: '" could not be matched to a known command...',
						color: "white",
					},
				],
				discord: {
					color: parseInt(hex["red"], 16),
					title: `The command "${string}" could not be matched to a known command...`,
					timestamp: new Date(),
				},
			},
			logTo
		);
		return;
	}
	const exeStart = Date.now();
	let commandOutput = await command({ string, args, logTo }).catch((err) => lErr(err, logTo, `Error while executing command "${string}"`));
	if (commandOutput === undefined) return;
	if (!Array.isArray(commandOutput)) commandOutput = [commandOutput];
	for (const output of commandOutput) {
		if (output.discord !== undefined && typeof output.discord !== "string") {
			const exeTime = `Executed in ${Date.now() - exeStart}`;
			if (output.discord?.footer?.text !== undefined) output.discord.footer.text = `${output.discord.footer.text} • ${exeTime}`;
			else {
				output.discord = output.discord || {};
				output.discord.footer = output.discord.footer || {};
				output.discord.footer.text = exeTime;
			}
		}
		await logg(output, logTo).catch((err) => lErr(err, logTo, `Command executed. Error while processing output for: "${string}"`));
	}
};

thread.on("consoleStdin", commandHandler);

export const logg = async (output: Output, logTo?: LogTo) => {
	if (output.console !== undefined) console.log(output.console);
	if (output.minecraft !== undefined && logTo?.minecraft !== undefined) {
		if (typeof output.minecraft === "string") await wrapperCore.serverStdin(output.minecraft);
		else await wrapperCore.serverStdin(`tellraw ${logTo.minecraft} ${JSON.stringify(output.minecraft)}`);
	}
	// if (output.discord) logTo.discord.send(output.discord);
};

const lErr = async (err: Error, logTo?: LogTo, message?: string) =>
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
