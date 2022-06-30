import chalk from "chalk";

import { mc, hex } from "@spookelton/wrapperHelpers/colors";
import { commands, logg, lErr, getThread } from "..";

// Import Types
import type { LogTo } from "@spookelton/wrapperHelpers/types";
import type { DiscordMessage } from "@spookelton/wrapperHelpers/types";
import type { DiscordModule, AuthModule } from "..";

export const minecraftHandler = async (string: string) => {
	const authThread = await getThread<AuthModule>("@spookelton/auth");
	if (authThread === undefined) return;
	// Get username and message out of "[01:06:15] [Server thread/INFO]: <greysilly7> asd"

	// Get word in middle on "<>" in string
	const username = string.split("<")[1].split(">")[0];
	const message = string.split(">")[1].trim();
	if (username === null || message === null) return;
	const canRunCommand = await authThread.minecraftUserAllowedCommand(message, username);
	if (!canRunCommand) return;
	console.log(chalk`{grey [}${chalk.hex("")(`${username}`)}{grey ]}: ${message}`);
	commandHandler(message, {console: true, minecraft: true});
};

export const consoleHandler = (string: string) => commandHandler(string, { console: true });

export const discordHandler = async (message: DiscordMessage) => {
	const discordThread = await getThread<DiscordModule>("@spookelton/discord");
	if (discordThread === undefined) return;
	if (message.inManagementChannel || message.mentions.bot) {
		// console.log(JSON.stringify(message, null, "  "));
		if (message.mentions.bot) {
			const authThread = await getThread<AuthModule>("@spookelton/auth");
			if (authThread === undefined) return;
			message.content = message.content.slice(message.content.indexOf(" ") + 1, message.content.length);
			const canRunCommand = await authThread.discordUserAllowedCommand(message.content, message.author).catch((err: Error) => lErr(err, { discord: message }));
			if (!canRunCommand) return;
		}
		console.log(chalk`{grey [}${chalk.hex(message.author.color || "")(`@${message.author.username}`)}{grey ]}: ${message.content}`);
		if (message.content[0] === "!") {
			if (message.mentions.bot) await discordThread.addTempManagementChannel(message.channelId);
			return logg({ minecraft: `${message.content.slice(1)}\n` }, { minecraft: true });
		} else commandHandler(message.content, { discord: message });
	}
};

export const commandHandler = async (string: string, logTo?: LogTo): Promise<void> => {
	string = string.replace(/\s\s+/g, " ").replace("\r", ""); // Compact multiple spaces/tabs down to one
	if (string[0] !== "~" && string[0] !== "?") return; // If the first character isn't a command, ignore it

	// Generate array of args grouping by spaces and quotes
	// TODO: Write explanation on why and how this works
	const [commandName, ...args] = string
		.slice(1)
		.split(string.includes('"') ? '"' : " ")
		.map((a) => a.split(" "))
		.flatMap((a => a.indexOf("") != -1 ? a.filter(v => v != "") : a.join(" ")))

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
					embeds: [
						{
							color: parseInt(hex["red"], 16),
							title: `The command "${string}" could not be matched to a known command...`,
							timestamp: Date.now(),
						},
					],
				},
			},
			logTo
		);
		return;
	}
	if (string[0] === "?") {
		await logg(command.help, logTo);
		return;
	}
	const exeStart = Date.now();
	let commandOutput = await command({ string, args, logTo }).catch((err) => lErr(err, logTo, `Executing command failed "${string}"`));
	if (commandOutput === undefined) return;
	if (!Array.isArray(commandOutput)) commandOutput = [commandOutput];
	for (const output of commandOutput) {
		if (output.discord !== undefined && typeof output.discord !== "string") {
			const exeTime = `Executed in ${Date.now() - exeStart}ms`;
			for (const embed of output.discord?.embeds || []) {
				if (embed.footer?.text !== undefined) embed.footer.text = `${embed.footer.text} • ${exeTime}`;
				else {
					embed.footer ??= {};
					embed.footer.text ??= exeTime;
				}
			}
		}
		await logg(output, logTo).catch((err) => lErr(err, logTo, `Command executed. Error while processing output for: "${string}"`));
	}
};
