import type { Message } from "discord.js";

export default (message: Message, inManagementChannel: boolean) => ({
	inManagementChannel,
	channelId: message.channelId,
	guildId: message.guildId,
	deleted: message.deleted,
	id: message.id,
	content: message.content,
	author: {
		id: message.author.id,
		bot: message.author.bot,
		username: message.author.username,
	},
	createdTimestamp: message.createdTimestamp,
	editedTimestamp: message.editedTimestamp,
	mentions: {
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
