import fs from "fs";
import chalk from "chalk";
import { AttachmentPayload, Client, GatewayIntentBits } from "discord.js";

import db from "@inrixia/db";
import { chunkArray } from "@inrixia/helpers/object";

import { buildModuleInfo } from "@spookelton/wrapperHelpers/modul";
import { buildMessage } from "@spookelton/wrapperHelpers/discord";

// Import Types
import type { DiscordEmbed, WrapperModule } from "@spookelton/wrapperHelpers/types";
import type { TextBasedChannel, BaseMessageOptions, Message } from "discord.js";

// Export moduleInfo
export const moduleInfo = buildModuleInfo({
	color: "blueBright",
	description: "Handles all things discord.",
});

type ModuleSettings = {
	messageFlushRate: number;
	discordToken: string;
	managementChannels: string[];
	chat: {
		webhookId: string;
		webhookToken: string;
	};
};

export const moduleSettings = db<ModuleSettings>("./_db/discord.json", {
	forceCreate: true,
	updateOnExternalChanges: true,
	pretty: true,
	template: {
		messageFlushRate: 1000,
		discordToken: "",
		managementChannels: [],
		chat: {
			webhookId: "",
			webhookToken: "",
		},
	},

});

const discord = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const flatMessages: Record<string, number> = {};
const getManagementChannels = async () => {
	const channels = await Promise.all(moduleSettings.managementChannels.map((channelId) => discord.channels.fetch(channelId)));
	return <TextBasedChannel[]>channels.filter((channel) => channel !== null && channel.isTextBased());
};

// Thread stuff
const thread = (module.parent as WrapperModule).thread;

const rgbToHex = (rgb: number): string => {
	let hex = rgb.toString(16);
	if (hex.length < 2) hex = "0" + hex;
	return hex;
};

const chikachiPath = "./config/Chikachi/discordintegration.json";

(async () => {
	if (moduleSettings.discordToken === "" && fs.existsSync(chikachiPath)) moduleSettings.discordToken = fs.readFileSync(chikachiPath, "utf8").slice(31, 90);
	if (moduleSettings.discordToken === "") {
		// TODO: Exit thread dont just quitely disable
		console.log(chalk`[{red @spookelton/discord}]: No Token Found! Exiting...`);
		return;
	}
	// Sign into discord and attempt to fetch avatar color
	console.log(chalk`Using Discord Token: {${moduleInfo.color} ${moduleSettings.discordToken}}`);
	await discord.login(moduleSettings.discordToken);
	await new Promise((res) => discord.once("ready", res));
	// On receive message from discord server
	discord.on("messageCreate", async (message) => {
		if (message.author.id === discord.user!.id) return;
		thread.emit("discordMessage", buildMessage(message, moduleSettings.managementChannels.includes(message.channelId)));
	});

	// Wait for server to start before redirecting console
	thread.once("serverStarted", ({ startTime }: { startTime: number }) => (flatMessages[`Server started in ${startTime}ms\n`] = 1));
	// Log "Server Starting..." on startup
	thread.once("serverStdoutPreStart", () => (flatMessages["Server Starting...\n"] = 1));

	// Once server has started redirect console to management channels
	thread.on("serverStdout", (string: string) => {
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
			for (const channel of await getManagementChannels()) {
				for (const chunk of chunkArray(discordData, 2000)) {
					channel.send(chunk).catch(console.error);
				}
			}
			discordData = "";
		}
	}, moduleSettings.messageFlushRate);

	thread.on("consoleStdout", async (string: string) => {
		for (const channel of await getManagementChannels()) channel.send(`[Console]: ${string}\n`).catch(console.error);
	});
})();

export const sendWebhookMessage = async (username: string, message: string) => {
	const webhook = await discord.fetchWebhook(moduleSettings.chat.webhookId, moduleSettings.chat.webhookToken);
	webhook.send({
		username: `[${discord.user?.username}] ${username} `,
		avatarURL: `https://crafthead.net/cube/${username}.png`,
		content: message.replace(`**<**${username}**>**`, ""),
	});
};

export const sendWebhookEmbed = async (embed: DiscordEmbed) => {
	const webhook = await discord.fetchWebhook(moduleSettings.chat.webhookId, moduleSettings.chat.webhookToken);
	return webhook.send({
		username: discord.user?.username,
		avatarURL: discord.user?.avatarURL() ?? undefined,
		embeds: [embed],
	});
};

export const sendToChannel = async (channelId: string, message: string | BaseMessageOptions): Promise<Message> => {
	const channel = await discord.channels.fetch(channelId);

	if (typeof message !== "string" && message.files !== undefined) {
		message.files = (message.files as AttachmentPayload[]).map((file) => {
			if (typeof file.attachment !== "string") return { ...file, attachment: Buffer.from(file.attachment as any) };
			return file;
		});
	}
	if (channel?.isTextBased()) return channel.send(message);
	throw new Error("Channel is not a text channel");
};

export const addTempManagementChannel = async (tempChannelId: string, timeout = 500): Promise<void> => {
	if (moduleSettings.managementChannels.includes(tempChannelId)) return;
	const channel = await discord.channels.fetch(tempChannelId);
	if (channel === null) throw new Error(`Management channel ${tempChannelId} is null!`);
	if (!channel.isTextBased()) throw new Error(`Management channel ${tempChannelId} is not a text channel!`);
	moduleSettings.managementChannels.push(tempChannelId);
	setTimeout(() => (moduleSettings.managementChannels = moduleSettings.managementChannels.filter((channelId) => channelId !== tempChannelId)), timeout);
};
