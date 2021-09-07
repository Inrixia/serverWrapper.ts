import fs from "fs";
import chalk from "chalk";
import ColorThief from "colorthief";
import { Client, Intents } from "discord.js";

import db from "@inrixia/db";

import { buildModuleInfo } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { WrapperModule } from "@spookelton/wrapperHelpers/types";
import type { TextBasedChannels, MessagePayload, MessageOptions, Message } from "discord.js";

// Export moduleInfo
export const moduleInfo = buildModuleInfo({
	color: "blueBright",
	description: "Handles all things discord.",
});

type ModuleSettings = {
	messageFlushRate: number;
	discordToken: string;
	managementChannels: string[];
};

export const moduleSettings = db<ModuleSettings>("./_db/discord.json", {
	forceCreate: true,
	updateOnExternalChanges: true,
	pretty: true,
	template: {
		messageFlushRate: 100,
		discordToken: "",
		managementChannels: [],
	},
});

const discord = new Client({ intents: [Intents.FLAGS.GUILDS] });

const flatMessages: Record<string, number> = {};
const managementChannels = async () => {
	const channels = await Promise.all(moduleSettings.managementChannels.map((channelId) => discord.channels.fetch(channelId)));
	return channels.filter((channel) => channel !== null && channel.isText()) as TextBasedChannels[];
};
let clientAvatarColor: number | undefined;

// Thread stuff
const thread = (module.parent as WrapperModule).thread;

const rgbToHex = (rgb: number): string => {
	let hex = rgb.toString(16);
	if (hex.length < 2) hex = "0" + hex;
	return hex;
};

const chikachiPath = "./config/Chikachi/DiscordIntegration.json";

(async () => {
	if (moduleSettings.discordToken === "" && fs.existsSync(chikachiPath)) moduleSettings.discordToken = fs.readFileSync(chikachiPath, "utf8").slice(31, 90);
	if (moduleSettings.discordToken === "") throw new Error(chalk`[{${moduleInfo.color} @spookelton/discord}]: {redBright No Token Found!}\n`);
	// Sign into discord and attempt to fetch avatar color
	console.log(chalk`Using Discord Token: {${moduleInfo.color} ${moduleSettings.discordToken}}`);
	await discord.login(moduleSettings.discordToken);
	await new Promise((res) => discord.once("ready", res));
	if (discord.user !== null) {
		const avatarUrl = discord.user.avatarURL();
		if (avatarUrl !== null) {
			try {
				const cArr = await ColorThief.getColor(avatarUrl);
				clientAvatarColor = parseInt(rgbToHex(cArr[0]) + rgbToHex(cArr[1]) + rgbToHex(cArr[2]), 16);
			} catch (err) {
				if (err instanceof Error) {
					err.message = chalk`[{${moduleInfo.color} @spookelton/discord}]: {redBright Failed to parse discordBot avatar color!}\n${err.message}`;
				}
				throw err;
			}
		}
	}

	// Handle Management Channels
	if (moduleSettings.managementChannels.length !== 0) {
		thread.on("serverStdout", (string: string) => {
			if (string.includes("DiscordIntegration")) return;
			flatMessages[string] ??= 0;
			flatMessages[string]++;
		});
		setInterval(async () => {
			let discordData = "";
			for (const string in flatMessages) {
				if (flatMessages[string] !== 1) discordData += `**${flatMessages[string]}x** ${string}`;
				else discordData += string;
				delete flatMessages[string];
			}
			if (discordData !== "") {
				for (const channel of await managementChannels()) channel.send(discordData).catch(console.error);
				discordData = "";
			}
		}, moduleSettings.messageFlushRate);

		thread.on("consoleStdin", async (string: string) => {
			for (const channel of await managementChannels()) channel.send(`[Console] > ${string}\n`).catch(console.error);
		});
	}
})();

export const sendToChannel = async (channelId: string, message: string | MessagePayload | MessageOptions): Promise<Message> => {
	const channel = await discord.channels.fetch(channelId);
	if (channel?.isText()) return channel.send(message);
	throw new Error("Channel is not a text channel");
};

export const addTempManagementChannel = async (channelId: string, timeout = 500): Promise<void> => {
	if (moduleSettings.managementChannels.includes(channelId)) return;
	const channel = await discord.channels.fetch(channelId);
	if (channel === null) throw new Error(`Management channel ${channelId} is null!`);
	if (!channel.isText()) throw new Error(`Management channel ${channelId} is not a text channel!`);
	moduleSettings.managementChannels.push(channelId);
	setTimeout(() => (moduleSettings.managementChannels = moduleSettings.managementChannels.filter((channelId) => channelId !== channelId)), timeout);
};

// On receive message from discord server
discord.on("messageCreate", async (message) => {
	if (message.author.id === discord.user!.id) return;
	if (moduleSettings.managementChannels.includes(message.channelId)) return;
	thread.emit("discordMessage", message.toJSON());
});
