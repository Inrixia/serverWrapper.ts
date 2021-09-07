import type { Message } from "discord.js";

export default (message: Message, inManagementChannel: boolean) => ({
	inManagementChannel,
	channelId: message.channelId,
	guildId: message.guildId,
	deleted: message.deleted,
	id: message.id,
	content: message.cleanContent,
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
		bot: message.mentions.has(message.client.user!.id),
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
