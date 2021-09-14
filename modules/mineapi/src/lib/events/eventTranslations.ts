const rawEvents: RawEventTranslation[] = [
	{
		name: "PlayerMessage",
		match: "<%username%> %message%",
		text: "**<**%username%**>** %message%",
		embed: {
			description: "%message%",
			author: {
				name: "%username%",
				icon_url: "%username%_image",
			},
		},
		send: {
			embed: false,
			text: true,
		},
	},
	{
		name: "PlayerJoined",
		match: "%username% joined the game",
		text: "**<%username%>** joined the server!",
		embed: {
			description: "**%username%** joined the game!",
			author: {
				name: "",
				icon_url: "%username%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "PlayerLeft",
		match: "%username% left the game",
		text: "**<%username%>** left the server!",
		embed: {
			description: "**%username%** left the game!",
			author: {
				name: "",
				icon_url: "%username%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "PlayerAdvancement",
		match: "%username% has made the advancement %advancement%",
		text: "**<%username%>** gained the achievement **%advancement%**!",
		embed: {
			description: "Made the advancement **%advancement%**",
			author: {
				name: "%username%",
			},
			thumbnail: {
				url: "%username%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "PlayerGoal",
		match: "%username% has reached the goal %goal%",
		text: "**<%username%>** reached the goal **%goal%**!",
		embed: {
			description: "Reached the goal **%goal%**",
			author: {
				name: "%username%",
			},
			thumbnail: {
				url: "%username%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "PlayerChallenge",
		match: "%username% has completed the challenge %challenge%",
		text: "**<%username%>** has completed the challenge **%challenge%**!",
		embed: {
			description: "Completed the challenge **%challenge%**",
			author: {
				name: "%username%",
			},
			thumbnail: {
				url: "%username%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "KilledInFire",
		match: "%entity% went up in flames",
		text: "**<%entity%>** went up in flames",
		embed: {
			author: {
				name: "%entity% went up in flames",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "DiedOnFire",
		match: "%entity% burned to death",
		text: "**<%entity%>** burned to death",
		embed: {
			author: {
				name: "%entity% burned to death",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "DiedInLava",
		match: "%entity% tried to swim in lava",
		text: "**<%entity%>** tried to swim in lava",
		embed: {
			author: {
				name: "%entity% tried to swim in lava",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "DiedInWall",
		match: "%entity% suffocated in a wall",
		text: "**<%entity%>** suffocated in a wall",
		embed: {
			author: {
				name: "%entity% suffocated in a wall",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "Drowned",
		match: "%entity% drowned",
		text: "**<%entity%>** drowned",
		embed: {
			author: {
				name: "%entity% drowned",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "DrownedEscaping",
		match: "%entityA% drowned whilst trying to escape %entityB%",
		text: "**<%entityA%>** drowned whilst trying to escape **<%entityB%>**",
		embed: {
			author: {
				name: "%entityA% drowned whilst trying to escape %entityB%",
				icon_url: "%entityA%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "Starved",
		match: "%entity% starved to death",
		text: "**<%entity%>** starved to death",
		embed: {
			author: {
				name: "%entity% starved to death",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "Pricked",
		match: "%entity% was pricked to death",
		text: "**<%entity%>** was pricked to death",
		embed: {
			author: {
				name: "%entity% was pricked to death",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "HuggedACactus",
		match: "%entity% hugged a cactus",
		text: "**<%entity%>** hugged a cactus",
		embed: {
			author: {
				name: "%entity% hugged a cactus",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "WalkedIntoCactus",
		match: "%entityA% walked into a cactus while trying to escape %entityB%",
		text: "**<%entity%>** walked into a cactus while trying to escape **<%entityB%>**",
		embed: {
			author: {
				name: "%entityA% walked into a cactus while trying to escape %entityB%",
				icon_url: "%entityA%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "HitTheGroundTooHard",
		match: "%entity% hit the ground too hard",
		text: "**<%entity%>** hit the ground too hard",
		embed: {
			author: {
				name: "%entity% hit the ground too hard",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "DiedOutOfWorld",
		match: "%entity% fell out of the world",
		text: "**<%entity%>** fell out of the world",
		embed: {
			author: {
				name: "%entity% fell out of the world",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "Died",
		match: "%entity% died",
		text: "**<%entity%>** died",
		embed: {
			author: {
				name: "%entity% died",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "Exploded",
		match: "%entity% blew up",
		text: "**<%entity%>** blew up",
		embed: {
			author: {
				name: "%entity% blew up",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "ExplodedBy",
		match: "%entityA% was blown up by %entityB%",
		text: "**<%entityA%>** was blown up by **<%entityB%>**",
		embed: {
			author: {
				name: "%entityA% was blown up by %entityB%",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "KilledByMagic",
		match: "%entity% was killed by magic",
		text: "**<%entity%>** was killed by magic",
		embed: {
			author: {
				name: "%entity% was killed by magic",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "SlainBy",
		match: "%entityA% was slain by %entityB%",
		text: "**<%entityA%>** was slain by **%entityB%**",
		embed: {
			author: {
				name: "%entityA% was slain by %entityB%",
				icon_url: "%entityA%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "ShotBy",
		match: "%entityA% was shot by %entityB%",
		text: "**<%entityA%>** was shot by **%entityB%**",
		embed: {
			author: {
				name: "%entityA% was shot by %entityB%",
				icon_url: "%entityA%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "ShotByUsing",
		match: "%entityA% was shot by %entityB% using %bowName%",
		text: "**<%entityA%>** was shot by **%entityB% using %bowName%**",
		embed: {
			author: {
				name: "%entityA% was shot by %entityB% using %bowName%",
				icon_url: "%entityA%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "FireballedBy",
		match: "%entityA% was fireballed by %entityB%",
		text: "**<%entityA%>** was fireballed by **%entityB%**",
		embed: {
			author: {
				name: "%entityA% was fireballed by %entityB%",
				icon_url: "%entityA%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "PummeledBy",
		match: "%entityA% was pummeled by %entityB%",
		text: "**<%entityA%>** was pummeled by **%entityB%**",
		embed: {
			author: {
				name: "%entityA% was pummeled by %entityB%",
				icon_url: "%entityA%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "KilledBy",
		match: "%entityA% was killed by %entityB%",
		text: "**<%entityA%>** was killed by **%entityB%**",
		embed: {
			author: {
				name: "%entityA% was killed by %entityB%",
				icon_url: "%entityA%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "ElytraCrashed",
		match: "%entity% experienced kinetic energy",
		text: "**<%entity%>** experienced kinetic energy",
		embed: {
			author: {
				name: "%entity% experienced kinetic energy",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "FellFromHighPlace",
		match: "%entity% fell from a high place",
		text: "**<%entity%>** fell from a high place",
		embed: {
			author: {
				name: "%entity% fell from a high place",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "FellFromLadder",
		match: "%entity% fell off a ladder",
		text: "**<%entity%>** fell off a ladder",
		embed: {
			author: {
				name: "%entity% fell off a ladder",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "FellFromVines",
		match: "%entity% fell off some vines",
		text: "**<%entity%>** fell off some vines",
		embed: {
			author: {
				name: "%entity% fell off some vines",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "FellOutOfWater",
		match: "%entity% fell out of the water",
		text: "**<%entity%>** out of the water",
		embed: {
			author: {
				name: "%entity% fell out of the water",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "FellIntoFire",
		match: "%entity% fell into a patch of fire",
		text: "**<%entity%>** fell into a patch of fire",
		embed: {
			author: {
				name: "%entity% fell into a patch of fire",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "FellIntoCacti",
		match: "%entity% fell into a patch of cacti",
		text: "**<%entity%>** fell into a patch of cacti",
		embed: {
			author: {
				name: "%entity% fell into a patch of cacti",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "DoomedToFall",
		match: "%entityA% was doomed to fall by %entityB%",
		text: "**<%entityA%>** was doomed to fall by %entityB%",
		embed: {
			author: {
				name: "%entityA% was doomed to fall by %entityB%",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "ShootOffVines",
		match: "%entityA% was shot off some vines by %entityB%",
		text: "**<%entityA%>** was shot off some vines by %entityB%",
		embed: {
			author: {
				name: "%entityA% was shot off some vines by %entityB%",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "BlownFromHigh",
		match: "%entityA% was blown from a high place by %entityB%",
		text: "**<%entityA%>** was blown from a high place by %entityB%",
		embed: {
			author: {
				name: "%entityA% was blown from a high place by %entityB%",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "SquashedByAnvil",
		match: "%entityA% was squashed by a falling anvil",
		text: "**<%entityA%>** was squashed by a falling anvil",
		embed: {
			author: {
				name: "%entityA% was squashed by a falling anvil",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "SquashedByBlock",
		match: "%entityA% was squashed by a falling block",
		text: "**<%entityA%>** was squashed by a falling block",
		embed: {
			author: {
				name: "%entityA% was squashed by a falling block",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "ElytraKilled",
		match: "%entity% removed an elytra while flying",
		text: "**<%entity%>** removed an elytra while flying",
		embed: {
			author: {
				name: "%entity% removed an elytra while flying",
				icon_url: "%entity%_image",
			},
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "Started",
		match: "serverStarted",
		text: "**Server Started**",
		embed: {
			description: "**Server Started**",
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "Stopping",
		match: "Stopping the server",
		text: "**Server stopping...**",
		embed: {
			description: "**Server stopping...**",
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "CrashHang",
		match: "A single server tick took %seconds% seconds",
		text: "@Mods Server crashed, a single server tick took %seconds% seconds, should be 0.05 seconds",
		embed: {
			description: "<@&344286675691896832> **Server crashed, a single tick took %seconds% seconds, should be 0.05 seconds**",
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "CrashTicking",
		match: "Encountered an unexpected exception net.minecraft.util.ReportedException: Ticking",
		text: "<@&344286675691896832> **Server crashed, reason: Ticking entity",
		embed: {
			description: "<@&344286675691896832> **Server crashed, reason: Ticking entity**",
		},
		send: {
			embed: true,
			text: false,
		},
	},
	{
		name: "CrashTickingWorldEntity",
		match: "Encountered an unexpected exception net.minecraft.util.ReportedException: Exception ticking world entities",
		text: "<@&344286675691896832> **Server crashed, reason: Ticking world entities",
		embed: {
			description: "<@&344286675691896832> **Server crashed, reason: Ticking world entities**",
		},
		send: {
			embed: true,
			text: false,
		},
	},
];

import { DiscordEmbed } from "@spookelton/wrapperHelpers/types";

type RawEventTranslation = {
	name: string;
	match: string;
	text: string;
	embed: DiscordEmbed;
	send: {
		embed: boolean;
		text: boolean;
	};
	matchReplacers?: string[] | null;
	matchRegex?: RegExp;
};
export type EventTranslation = Required<RawEventTranslation>;
export const events = ((): EventTranslation[] => {
	for (const event of rawEvents) {
		event.matchReplacers = event.match.match(/\%(.*?)\%/g);
		event.matchRegex = new RegExp(`.* ${event.match.replace(/\%(.*?)\%/g, "(.*?)")}$`);
	}
	return rawEvents as EventTranslation[];
})();
