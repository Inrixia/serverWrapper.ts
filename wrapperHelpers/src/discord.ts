import { ChannelType, Message } from "discord.js";
export const buildMessage = (message: Message, inManagementChannel: boolean) => ({
	inManagementChannel,
	channelId: message.channelId,
	guildId: message.guildId,
	id: message.id,
	cleanContent: message.cleanContent,
	content: message.content,
	isNSFW: message.channel.isTextBased() && message.channel.type === ChannelType.GuildText ? message.channel.nsfw : false,
	author: {
		id: message.author.id,
		bot: message.author.bot,
		username: message.author.username,
		roles: message.member?.roles.cache.map((role) => role.id),
		color: message.member?.roles.color?.hexColor,
	},
	createdTimestamp: message.createdTimestamp,
	editedTimestamp: message.editedTimestamp,
	mentions: {
		bot: message.mentions.has(message.client.user!.id) || message.mentions.roles.some((role) => message.guild?.members.me?.roles?.cache.has(role.id) || false),
		everyone: message.mentions.everyone,
		users: message.mentions.users.map((user) => ({
			avatar: user.avatar,
			bot: user.bot,
			id: user.id,
			username: user.username,
		})),
		roles: message.mentions.roles.map((role) => ({
			color: role.color,
			id: role.id,
			name: role.name,
		})),
	},
});
