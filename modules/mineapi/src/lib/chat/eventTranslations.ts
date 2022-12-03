enum EventName {
	PlayerMessage,
	PlayerJoined,
	PlayerLeft,
	PlayerAdvancement,
	PlayerGoal,
	PlayerChallenge,
	KilledInFire,
	DiedOnFire,
	DiedInLava,
	DiedInWall,
	Drowned,
	DrownedEscaping,
	Starved,
	Pricked,
	HuggedACactus,
	WalkedIntoCactus,
	HitTheGroundTooHard,
	DiedOutOfWorld,
	Died,
	Exploded,
	ExplodedBy,
	KilledByMagic,
	SlainBy,
	ShotBy,
	ShotByUsing,
	FireballedBy,
	PummeledBy,
	ElytraCrashed,
	KilledBy,
	FellFromHighPlace,
	FellFromLadder,
	FellFromVines,
	FellOutOfWater,
	FellIntoFire,
	FellIntoCacti,
	DoomedToFall,
	ShootOffVines,
	BlownFromHigh,
	SquashedByAnvil,
	SquashedByBlock,
	ElytraKilled,
	Started,
	Stopping,
	CrashHang,
	CrashTicking,
	CrashTickingWorldEntity
}

enum SendEvent {
	None,
	All,
	Embed,
	Text
}

const eventDefinitons = [
	{
		name: EventName.PlayerMessage,
		match: "<%username%> %message%",
		text: "**<**%username%**>** %message%",
		embed: {
			description: "%message%",
			author: {
				name: "%username%",
				icon_url: "%username%_image",
			},
		},
		send: SendEvent.Text,
	},
	{
		name: EventName.PlayerJoined,
		match: "%username% joined the game",
		text: "**<%username%>** joined the server!",
		embed: {
			description: "**%username%** joined the game!",
			author: {
				name: "",
				icon_url: "%username%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.PlayerLeft,
		match: "%username% left the game",
		text: "**<%username%>** left the server!",
		embed: {
			description: "**%username%** left the game!",
			author: {
				name: "",
				icon_url: "%username%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.PlayerAdvancement,
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
		send: SendEvent.Embed,
	},
	{
		name: EventName.PlayerGoal,
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
		send: SendEvent.Embed,
	},
	{
		name: EventName.PlayerChallenge,
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
		send: SendEvent.Embed,
	},
	{
		name: EventName.KilledInFire,
		match: "%entity% went up in flames",
		text: "**<%entity%>** went up in flames",
		embed: {
			author: {
				name: "%entity% went up in flames",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.DiedOnFire,
		match: "%entity% burned to death",
		text: "**<%entity%>** burned to death",
		embed: {
			author: {
				name: "%entity% burned to death",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.DiedInLava,
		match: "%entity% tried to swim in lava",
		text: "**<%entity%>** tried to swim in lava",
		embed: {
			author: {
				name: "%entity% tried to swim in lava",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.DiedInWall,
		match: "%entity% suffocated in a wall",
		text: "**<%entity%>** suffocated in a wall",
		embed: {
			author: {
				name: "%entity% suffocated in a wall",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.Drowned,
		match: "%entity% drowned",
		text: "**<%entity%>** drowned",
		embed: {
			author: {
				name: "%entity% drowned",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.DrownedEscaping,
		match: "%entityA% drowned whilst trying to escape %entityB%",
		text: "**<%entityA%>** drowned whilst trying to escape **<%entityB%>**",
		embed: {
			author: {
				name: "%entityA% drowned whilst trying to escape %entityB%",
				icon_url: "%entityA%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.Starved,
		match: "%entity% starved to death",
		text: "**<%entity%>** starved to death",
		embed: {
			author: {
				name: "%entity% starved to death",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.Pricked,
		match: "%entity% was pricked to death",
		text: "**<%entity%>** was pricked to death",
		embed: {
			author: {
				name: "%entity% was pricked to death",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.HuggedACactus,
		match: "%entity% hugged a cactus",
		text: "**<%entity%>** hugged a cactus",
		embed: {
			author: {
				name: "%entity% hugged a cactus",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.WalkedIntoCactus,
		match: "%entityA% walked into a cactus while trying to escape %entityB%",
		text: "**<%entity%>** walked into a cactus while trying to escape **<%entityB%>**",
		embed: {
			author: {
				name: "%entityA% walked into a cactus while trying to escape %entityB%",
				icon_url: "%entityA%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.HitTheGroundTooHard,
		match: "%entity% hit the ground too hard",
		text: "**<%entity%>** hit the ground too hard",
		embed: {
			author: {
				name: "%entity% hit the ground too hard",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.DiedOutOfWorld,
		match: "%entity% fell out of the world",
		text: "**<%entity%>** fell out of the world",
		embed: {
			author: {
				name: "%entity% fell out of the world",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.Died,
		match: "%entity% died",
		text: "**<%entity%>** died",
		embed: {
			author: {
				name: "%entity% died",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.Exploded,
		match: "%entity% blew up",
		text: "**<%entity%>** blew up",
		embed: {
			author: {
				name: "%entity% blew up",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.ExplodedBy,
		match: "%entityA% was blown up by %entityB%",
		text: "**<%entityA%>** was blown up by **<%entityB%>**",
		embed: {
			author: {
				name: "%entityA% was blown up by %entityB%",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.KilledByMagic,
		match: "%entity% was killed by magic",
		text: "**<%entity%>** was killed by magic",
		embed: {
			author: {
				name: "%entity% was killed by magic",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.SlainBy,
		match: "%entityA% was slain by %entityB%",
		text: "**<%entityA%>** was slain by **%entityB%**",
		embed: {
			author: {
				name: "%entityA% was slain by %entityB%",
				icon_url: "%entityA%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.ShotBy,
		match: "%entityA% was shot by %entityB%",
		text: "**<%entityA%>** was shot by **%entityB%**",
		embed: {
			author: {
				name: "%entityA% was shot by %entityB%",
				icon_url: "%entityA%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.ShotByUsing,
		match: "%entityA% was shot by %entityB% using %bowName%",
		text: "**<%entityA%>** was shot by **%entityB% using %bowName%**",
		embed: {
			author: {
				name: "%entityA% was shot by %entityB% using %bowName%",
				icon_url: "%entityA%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.FireballedBy,
		match: "%entityA% was fireballed by %entityB%",
		text: "**<%entityA%>** was fireballed by **%entityB%**",
		embed: {
			author: {
				name: "%entityA% was fireballed by %entityB%",
				icon_url: "%entityA%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.PummeledBy,
		match: "%entityA% was pummeled by %entityB%",
		text: "**<%entityA%>** was pummeled by **%entityB%**",
		embed: {
			author: {
				name: "%entityA% was pummeled by %entityB%",
				icon_url: "%entityA%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.KilledBy,
		match: "%entityA% was killed by %entityB%",
		text: "**<%entityA%>** was killed by **%entityB%**",
		embed: {
			author: {
				name: "%entityA% was killed by %entityB%",
				icon_url: "%entityA%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.ElytraCrashed,
		match: "%entity% experienced kinetic energy",
		text: "**<%entity%>** experienced kinetic energy",
		embed: {
			author: {
				name: "%entity% experienced kinetic energy",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.FellFromHighPlace,
		match: "%entity% fell from a high place",
		text: "**<%entity%>** fell from a high place",
		embed: {
			author: {
				name: "%entity% fell from a high place",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.FellFromLadder,
		match: "%entity% fell off a ladder",
		text: "**<%entity%>** fell off a ladder",
		embed: {
			author: {
				name: "%entity% fell off a ladder",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.FellFromVines,
		match: "%entity% fell off some vines",
		text: "**<%entity%>** fell off some vines",
		embed: {
			author: {
				name: "%entity% fell off some vines",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.FellOutOfWater,
		match: "%entity% fell out of the water",
		text: "**<%entity%>** out of the water",
		embed: {
			author: {
				name: "%entity% fell out of the water",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.FellIntoFire,
		match: "%entity% fell into a patch of fire",
		text: "**<%entity%>** fell into a patch of fire",
		embed: {
			author: {
				name: "%entity% fell into a patch of fire",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.FellIntoCacti,
		match: "%entity% fell into a patch of cacti",
		text: "**<%entity%>** fell into a patch of cacti",
		embed: {
			author: {
				name: "%entity% fell into a patch of cacti",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.DoomedToFall,
		match: "%entityA% was doomed to fall by %entityB%",
		text: "**<%entityA%>** was doomed to fall by %entityB%",
		embed: {
			author: {
				name: "%entityA% was doomed to fall by %entityB%",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.ShootOffVines,
		match: "%entityA% was shot off some vines by %entityB%",
		text: "**<%entityA%>** was shot off some vines by %entityB%",
		embed: {
			author: {
				name: "%entityA% was shot off some vines by %entityB%",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.BlownFromHigh,
		match: "%entityA% was blown from a high place by %entityB%",
		text: "**<%entityA%>** was blown from a high place by %entityB%",
		embed: {
			author: {
				name: "%entityA% was blown from a high place by %entityB%",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.SquashedByAnvil,
		match: "%entityA% was squashed by a falling anvil",
		text: "**<%entityA%>** was squashed by a falling anvil",
		embed: {
			author: {
				name: "%entityA% was squashed by a falling anvil",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.SquashedByBlock,
		match: "%entityA% was squashed by a falling block",
		text: "**<%entityA%>** was squashed by a falling block",
		embed: {
			author: {
				name: "%entityA% was squashed by a falling block",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.ElytraKilled,
		match: "%entity% removed an elytra while flying",
		text: "**<%entity%>** removed an elytra while flying",
		embed: {
			author: {
				name: "%entity% removed an elytra while flying",
				icon_url: "%entity%_image",
			},
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.Started,
		match: "serverStarted",
		text: "**Server Started**",
		embed: {
			description: "**Server Started**",
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.Stopping,
		match: "Stopping the server",
		text: "**Server stopping...**",
		embed: {
			description: "**Server stopping...**",
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.CrashHang,
		match: "A single server tick took %seconds% seconds",
		text: "@Mods Server crashed, a single server tick took %seconds% seconds, should be 0.05 seconds",
		embed: {
			description: "<@&344286675691896832> **Server crashed, a single tick took %seconds% seconds, should be 0.05 seconds**",
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.CrashTicking,
		match: "Encountered an unexpected exception net.minecraft.util.ReportedException: Ticking",
		text: "<@&344286675691896832> **Server crashed, reason: Ticking entity",
		embed: {
			description: "<@&344286675691896832> **Server crashed, reason: Ticking entity**",
		},
		send: SendEvent.Embed,
	},
	{
		name: EventName.CrashTickingWorldEntity,
		match: "Encountered an unexpected exception net.minecraft.util.ReportedException: Exception ticking world entities",
		text: "<@&344286675691896832> **Server crashed, reason: Ticking world entities",
		embed: {
			description: "<@&344286675691896832> **Server crashed, reason: Ticking world entities**",
		},
		send: SendEvent.Embed,
	},
] as const;

import { ValueOf, ValueOfA } from "@inrixia/helpers/ts";
import { DiscordEmbed } from "@spookelton/wrapperHelpers/types";

// const fillEmbed = async (embed: EventTranslation["embed"], match: string, fill: string) => {
// 	for (const key in embed) {
// 		if (typeof embed[key] === "string") {
// 			embed[key] = embed[key].replace(match, fill);
// 			if (embed[key] === `${fill}_image`) {
// 				embed[key] = `https://crafthead.net/cube/${fill}.png`;
// 			}
// 			return;
// 		}
// 		await fillEmbed(embed[key], match, fill);
// 	}
// };

type RawEvent = ValueOfA<typeof eventDefinitons>;
type EventWithMatchers = RawEvent & { matchReplacers: RegExpMatchArray | null, matchRegex: RegExp }

const addMatchers = (events: typeof eventDefinitons): EventWithMatchers[] => {
	const eventsWithMatchers: EventWithMatchers[] = [];
	for (const event of events) {
		eventsWithMatchers.push({
			...event,
			matchReplacers: event.match.match(/\%(.*?)\%/g),
			matchRegex: new RegExp(`.* ${event.match.replace(/\%(.*?)\%/g, "(.*?)")}$`)
		})
	}
	return eventsWithMatchers
}

export const eventsWithMatchers = addMatchers(eventDefinitons);

type Event<Def extends RawEvent = RawEvent> = Def & {
	parameters: Parameters<Def["text"]>
};

const buildParameters = <E extends RawEvent>(event: E): Event<E> => {
	return {
		...event,
		parameters: <Parameters<E["text"]>>[]
	};
}
// Ugh let me get on my desktop you lil old man
const parseEvent = (string: string): Event => {
	for (const event of events) {
		const match = string.replace(/\n|\r/g, "").match(event.matchRegex);
		if (match !== null) {
			
			break;
		}
	}
}

type Parameters<S extends string> = S extends `${infer Start}%${infer Value}%${infer End}` ? [Value, ...Parameters<Start>, ...Parameters<End>] : []

type D = Parameters<"**<%username%>** gained the achievement **%advancement%**!">
