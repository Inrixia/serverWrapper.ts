// export const thisModule = "discord";

// // Import core packages
// import discordjs from "discord.js";
// import ColorThief from "colorthief";

// import type { Command, ModuleColors, Message, CommandConfig, ThreadModule, SetModuleSettings, Init } from "@spookelton/wrapperHelpers";

// type ModuleSettings = {
// 	color: ModuleColors;
// 	managementChannels: Array<string>;
// 	chatChannel: number;
// 	discordToken: string;
// };

// // Set defaults
// let moduleSettings: ModuleSettings = (require.main as ThreadModule<ModuleSettings>).thread.data;
// const discord = new discordjs.Client();

// if (((wrapperSettings.modules["discord"] || {}).settings || {}).discord_token == "" && fs.existsSync("./config/Chikachi/DiscordIntegration.json")) {
// 	wrapperSettings.modules["discord"].settings.discord_token = fs.readFileSync("./config/Chikachi/DiscordIntegration.json", "utf8").slice(31, 90);
// }
// if (((wrapperSettings.modules["discord"] || {}).settings || {}).discord_token == "") {
// 	wrapperSettings.modules["discord"].enabled = false;
// 	process.stdout.write(`${wrapperSettings.c["redBright"].c}Disabled Module}: ${wrapperSettings.modules["discord"].color.c}discord.js}, No Token Found!\n`);
// }

// export const setModuleSettings: SetModuleSettings<ModuleSettings> = (newSettings) => {
// 	moduleSettings = newSettings;
// };

// const discordData = "";
// const flatMessages = {};
// const managementChannels: { [key: string]: discordjs.TextChannel } = {};
// let clientAvatarColor: number | undefined;

// export const init: Init = async () => {
// 	await openDiscord();
// 	// modul.event.on("serverStdout", message => serverStdout(message));
// 	// modul.event.on("consoleStdout", message => {
// 	// 	if (managementChannels.length > 0) managementChannels.forEach(channel => {
// 	// 		const match = message.match(/.{1,1999}/g);
// 	// 		if (match) match.map(async msg => {
// 	// 			channel.send(`[BOX] > ${msg}\n`, { split: true });
// 	// 		});
// 	// 	});
// 	// });
// 	// modul.event.on("serverEvent", event => {
// 	// 	if (chatChannel && mS.chatLink.enabled) {
// 	// 		event.filled.embed.color = clientAvatarColor;
// 	// 		chatChannel.send({ content: event.filled.text, embed: event.filled.embed });
// 	// 	}
// 	// });
// };

// export const discordStdin = async (message: { channel: string; msg: string }): Promise<void> => {
// 	if (message.channel) {
// 		const channel = await discord.channels.fetch(message.channel);
// 		if (channel && channel.type === "text") await (channel as discordjs.TextChannel).send(message.msg);
// 	}
// };

// export const addTempManagementChannel = async (channel: string): Promise<void> => {
// 	if (moduleSettings.managementChannels.indexOf(channel) == -1) {
// 		const managementChannel = await discord.channels.fetch(channel);
// 		if (managementChannel.type === "text") managementChannels[channel] = managementChannel as discordjs.TextChannel;
// 		else throw new Error(`Management channel ${channel} is not a text channel!`);
// 		setTimeout(() => delete managementChannels[channel], 500);
// 	}
// };

// const rgbToHex = (rgb: unknown): string => {
// 	let hex = Number(rgb).toString(16);
// 	if (hex.length < 2) hex = "0" + hex;
// 	return hex;
// };

// async function openDiscord() {
// 	// Fetch discordToken to use and display it at launch
// 	console.log(`Using Discord Token: ${moduleSettings.color.discord}${moduleSettings.discordToken}\u001b[0m`);
// 	await discord.login(moduleSettings.discordToken);
// 	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
// 	const cArr = (await ColorThief.getColor(discord.user!.avatarURL)) as [number, number, number];
// 	clientAvatarColor = parseInt(rgbToHex(cArr[0]) + rgbToHex(cArr[1]) + rgbToHex(cArr[2]), 16);
// }

// // On discord client login
// discord.on("ready", async () => {
// 	for (const channel of moduleSettings.managementChannels) {
// 		managementChannels[channel] = (await discord.channels.fetch(channel)) as discordjs.TextChannel;
// 	}
// 	// TODO: Break out chatLink into its own module
// 	// if (moduleSettings.chatLink.channelId) chatChannel = discord.channels.get(mS.chatLink.channelId);

// 	// TODO: Replace this with a call to properties module
// 	// properties.parse('./server.properties', {path: true}, (err, properties) => {
// 	// 	if (err) modul.lErr(err);
// 	// 	else discord.user.setActivity(properties.motd.replace(/§./g, '').replace(/\n.*/g, '').replace('// Von Spookelton - ', '').replace(' \\\\', ''), { type: 'WATCHING' })
// 	// });
// });

// // On receive message from discord server
// discord.on("message", async (message) => {
// 	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
// 	if (message.author.id == discord.user!.id) return;
// 	// if (mS.chatLink.enabled && message.channel.id == chatChannel.id) {
// 	// 	const msg = JSON.stringify(mS.chatLink.discordToMCFormat)
// 	// 		.replace("%username%", ((message.author||{}).username)||"Unknown User")
// 	// 		.replace("%message%", message.toString().trim());
// 	// 	return await modul.call("serverWrapper", "serverStdin", `/tellraw @a ${msg}\n`);
// 	// }
// 	if (!(moduleSettings.managementChannels.indexOf(message.channel.id) > -1)) return;
// 	const discordMessage = {
// 		channel: {
// 			id: (message.channel || {}).id || null,
// 			name: (message.channel || {}).name || null,
// 			calculatedPosition: (message.channel || {}).calculatedPosition || null,
// 			type: (message.channel || {}).type || null,
// 		},
// 		user: {
// 			id: (discord.user || {}).id || null,
// 			username: (discord.user || {}).username || null,
// 			avatar: (discord.user || {}).avatar || null,
// 			avatarURL: (discord.user || {}).avatarURL || null,
// 		},
// 		author: {
// 			id: (message.author || {}).id || null,
// 			username: (message.author || {}).username || null,
// 			avatarURL: (message.author || {}).avatarURL || null,
// 		},
// 		member: {
// 			roles: ((message.member || {}).roles || new discordjs.Collection()).array() || null,
// 		},
// 		mentions: {
// 			users:
// 				((message.mentions || {}).users || new discordjs.Collection()).map(function (mentionedUser) {
// 					return {
// 						id: (mentionedUser || {}).id || null,
// 						username: (mentionedUser || {}).username || null,
// 						avatar: (mentionedUser || {}).avatar || null,
// 						avatarURL: (mentionedUser || {}).avatarURL || null,
// 					};
// 				}) || null,
// 			roles:
// 				((message.mentions || {}).roles || new discordjs.Collection()).map(function (mentionedRole) {
// 					return {
// 						id: (mentionedRole || {}).id || null,
// 						name: (mentionedRole || {}).name || null,
// 						color: (mentionedRole || {}).color || null,
// 					};
// 				}) || null,
// 			channels:
// 				((message.mentions || {}).channels || new discordjs.Collection()).map(function (mentionedChannel) {
// 					return {
// 						id: (mentionedChannel || {}).id || null,
// 						name: (mentionedChannel || {}).name || null,
// 						calculatedPosition: (mentionedChannel || {}).calculatedPosition || null,
// 						type: (mentionedChannel || {}).type || null,
// 					};
// 				}) || null,
// 			everyone: ((message.mentions || {}).everyone || new discordjs.Collection()).array() || null,
// 		},
// 	};
// 	if (message.isMemberMentioned(discord.user))
// 		discordMessage.string = message
// 			.toString()
// 			.trim()
// 			.slice(message.toString().trim().indexOf(" ") + 1, message.toString().trim().length);
// 	else discordMessage.string = message.toString().trim();
// 	if (discordMessage.string) modul.emit("discordMessage", discordMessage);
// 	// if(chatChannel && discordMessage.channel.id === mS.chatLink.chatChannelId) {
// 	// 	modul.pSend(process, {
// 	// 		function: 'serverStdin',
// 	// 		string: `/say ${discordMessage.user.username}: ${discordMessage.string}`
// 	// 	});
// 	// }
// 	/*if (message.toString() == '^') {
// 		message.channel.send(`
// 		${"```"}javascript
// 		parentObject: {
// 			childObject: {
// 				childTitle: 'Blah'
// 			}
// 		}${"```"}`, { split: true }).then(responseMessage => {
// 			responseMessage.react('⬆');
// 			responseMessage.react('⬇');

// 			let reactFilter = (reaction, user) => reaction.emoji.name === '⬆' || ;
// 			responseMessage.awaitReactions(reactFilter, {time: 5000}).then(reactions => {
// 				debug((reactions.first().name == '⬆') + 'up')
// 				debug((reactions.first().name == '⬇') + 'down')
// 			});
// 		})
// 	}*/
// });

// // async function serverStdout(string) {
// // 	// every message we send spawns another stdout, so we don't want to infinite loop
// // 	if (string == "50\n") return;
// // 	if (string.indexOf("DiscordIntegration") > -1) return;
// // 	const trueString = string.split("\n");
// // 	for (let i = 0; i < trueString.length - 1; i++) {
// // 		flatMessages[trueString[i]+"\n"] = flatMessages[trueString[i]+"\n"] || 0;
// // 		flatMessages[trueString[i]+"\n"]++;
// // 	}

// // 	setTimeout(() => {
// // 		if (flatMessages != {}) {
// // 			for (message in flatMessages) {
// // 				if (flatMessages[message] > 1) discordData += `**${flatMessages[message]}x** ${message}`;
// // 				else discordData += message;
// // 				delete flatMessages[message];
// // 			}
// // 			if (discordData != "" && managementChannels.length > 0) {
// // 				managementChannels.forEach(channel => {
// // 					channel.send(discordData, { split: true });
// // 				});
// // 				discordData = "";
// // 			}
// // 		}
// // 	}, mS.messageFlushRate);
// // }
