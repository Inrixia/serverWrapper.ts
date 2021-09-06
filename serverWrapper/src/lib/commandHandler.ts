// Core imports
import chalk from "chalk";
import { serverStdin } from "../";
import { mc, hex } from "@spookelton/wrapperHelpers/colors";

// Import core commands
import * as commands from "../commands";

// Import Types
import type { LogTo, Output } from "@spookelton/wrapperHelpers/types";

export const commandHandler = async (string: string, logTo?: LogTo): Promise<void> => {
	string = string.replace(/\s\s+/g, " ").replace("\r", ""); // Compact multiple spaces/tabs down to one
	if (string[0] !== "~" && string[0] !== "?") return; // If the first character isn't a command, ignore it

	// Generate array of args grouping by spaces and quotes
	const args = string.split(' "').flatMap((arg) => (arg.includes('"') ? arg.replace('"', "") : arg.split(" ")));

	const commandName = args[0].slice(1);
	const command = commands[commandName as keyof typeof commands];
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
						color: mc.redBright,
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

export const logg = async (output: Output, logTo?: LogTo) => {
	console.log(output.console);
	if (output.minecraft !== undefined && logTo?.minecraft !== undefined) {
		if (typeof output.minecraft === "string") serverStdin(output.minecraft);
		else serverStdin(`tellraw ${logTo.minecraft} JSON.stringify([])`);
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
