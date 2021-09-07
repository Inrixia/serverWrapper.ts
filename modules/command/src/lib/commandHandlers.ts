import chalk from "chalk";

import { mc, hex } from "@spookelton/wrapperHelpers/colors";
import { commands, logg, lErr, discordModule } from "..";

// Import Types
import type { LogTo } from "@spookelton/wrapperHelpers/types";
import type { DiscordMessage } from "@spookelton/discord/types";

export const minecraftHandler = async (string: string) => {};

export const discordHandler = async (message: DiscordMessage) => {
	if (message.inManagementChannel || message.mentions.bot) {
		console.log(chalk`{grey [}{blueBright @${message.author.username}}{grey ]}: ${message.content}`);
		if (message.mentions.bot) message.content = message.content.slice(message.content.indexOf(" ") + 1, message.content.length);
		if (message.content[0] === "!") {
			if (message.mentions.bot) await discordModule.addTempManagementChannel(message.channelId);
			return logg({ minecraft: `${message.content.slice(1)}\n` }, { minecraft: true });
		}
	}
};

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
