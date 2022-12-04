export enum EventName {
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
	CrashTickingWorldEntity,
}

export enum SendEvent {
	Embed,
	Text,
}

const eventDefinitons = {
	[EventName.PlayerMessage]: {
		match: "<%username%> %message%",
		text: "%message%",
		embed: {
			description: "%message%",
			author: {
				name: "%username%",
				icon_url: "%username%_image",
			},
		},
		send: SendEvent.Text,
	},
	[EventName.PlayerJoined]: {
		match: "%username% joined the game",
		text: "**<%username%>** joined the server!",
		embed: {
			author: {
				name: "%username% Joined the game!",
				icon_url: "%username%_image",
			},
		},
		send: SendEvent.Embed,
	},
	[EventName.PlayerLeft]: {
		match: "%username% left the game",
		text: "**<%username%>** left the server!",
		embed: {
			author: {
				name: "%username% Left the game!",
				icon_url: "%username%_image",
			},
		},
		send: SendEvent.Embed,
	},
	[EventName.PlayerAdvancement]: {
		match: "%username% has made the advancement %advancement%",
		text: "**<%username%>** gained the achievement **%advancement%**!",
		embed: {
			description: "Made the advancement **%advancement%**",
			author: {
				name: "%username%",
				icon_url: "%username%_image",
			},
		},
		send: SendEvent.Embed,
	},
	[EventName.PlayerGoal]: {
		match: "%username% has reached the goal %goal%",
		text: "**<%username%>** reached the goal **%goal%**!",
		embed: {
			description: "Reached the goal **%goal%**",
			author: {
				name: "%username%",
				icon_url: "%username%_image",
			},
		},
		send: SendEvent.Embed,
	},
	[EventName.PlayerChallenge]: {
		match: "%username% has completed the challenge %challenge%",
		text: "**<%username%>** has completed the challenge **%challenge%**!",
		embed: {
			description: "Completed the challenge **%challenge%**",
			author: {
				name: "%username%",
				icon_url: "%username%_image",
			},
		},
		send: SendEvent.Embed,
	},
	[EventName.KilledInFire]: {
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
	[EventName.DiedOnFire]: {
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
	[EventName.DiedInLava]: {
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
	[EventName.DiedInWall]: {
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
	[EventName.Drowned]: {
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
	[EventName.DrownedEscaping]: {
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
	[EventName.Starved]: {
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
	[EventName.Pricked]: {
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
	[EventName.HuggedACactus]: {
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
	[EventName.WalkedIntoCactus]: {
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
	[EventName.HitTheGroundTooHard]: {
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
	[EventName.DiedOutOfWorld]: {
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
	[EventName.Died]: {
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
	[EventName.Exploded]: {
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
	[EventName.ExplodedBy]: {
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
	[EventName.KilledByMagic]: {
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
	[EventName.SlainBy]: {
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
	[EventName.ShotBy]: {
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
	[EventName.ShotByUsing]: {
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
	[EventName.FireballedBy]: {
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
	[EventName.PummeledBy]: {
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
	[EventName.KilledBy]: {
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
	[EventName.ElytraCrashed]: {
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
	[EventName.FellFromHighPlace]: {
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
	[EventName.FellFromLadder]: {
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
	[EventName.FellFromVines]: {
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
	[EventName.FellOutOfWater]: {
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
	[EventName.FellIntoFire]: {
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
	[EventName.FellIntoCacti]: {
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
	[EventName.DoomedToFall]: {
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
	[EventName.ShootOffVines]: {
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
	[EventName.BlownFromHigh]: {
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
	[EventName.SquashedByAnvil]: {
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
	[EventName.SquashedByBlock]: {
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
	[EventName.ElytraKilled]: {
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
	[EventName.Started]: {
		match: "serverStarted",
		text: "**Server Started**",
		embed: {
			description: "**Server Started**",
		},
		send: SendEvent.Embed,
	},
	[EventName.Stopping]: {
		match: "Stopping the server",
		text: "**Server stopping...**",
		embed: {
			description: "**Server stopping...**",
		},
		send: SendEvent.Embed,
	},
	[EventName.CrashHang]: {
		match: "A single server tick took %seconds% seconds",
		text: "@Mods Server crashed, a single server tick took %seconds% seconds, should be 0.05 seconds",
		embed: {
			description: "<@&344286675691896832> **Server crashed, a single tick took %seconds% seconds, should be 0.05 seconds**",
		},
		send: SendEvent.Embed,
	},
	[EventName.CrashTicking]: {
		match: "Encountered an unexpected exception net.minecraft.util.ReportedException: Ticking",
		text: "<@&344286675691896832> **Server crashed, reason: Ticking entity",
		embed: {
			description: "<@&344286675691896832> **Server crashed, reason: Ticking entity**",
		},
		send: SendEvent.Embed,
	},
	[EventName.CrashTickingWorldEntity]: {
		match: "Encountered an unexpected exception net.minecraft.util.ReportedException: Exception ticking world entities",
		text: "<@&344286675691896832> **Server crashed, reason: Ticking world entities",
		embed: {
			description: "<@&344286675691896832> **Server crashed, reason: Ticking world entities**",
		},
		send: SendEvent.Embed,
	},
} as const;

import { ValueOf } from "@inrixia/helpers/ts";

type EventDefinitions = typeof eventDefinitons;
type EventsWithMatchers = {
	[K in keyof EventDefinitions]: EventDefinitions[K] & { replacers: RegExpMatchArray | null; regex: RegExp; name: K };
};

const addMatchers = (events: typeof eventDefinitons): EventsWithMatchers => {
	const eventsWithMatchers = <EventsWithMatchers>events;
	for (const name in eventsWithMatchers) {
		const event = eventsWithMatchers[<keyof EventsWithMatchers>(<unknown>name)];
		event.replacers = event.match.match(/\%(.*?)\%/g);
		event.regex = new RegExp(`.*Server thread/INFO.* ${event.match.replace(/\%(.*?)\%/g, "(.*?)")}$`);
		event.name = parseInt(name);
	}
	return eventsWithMatchers;
};

export const eventsWithMatchers = addMatchers(eventDefinitons);

type Parameters<S extends string> = S extends `${infer Start}%${infer Value}%${infer End}`
	? { [k in Value]: string } & Parameters<Start> & Parameters<End>
	: {};
type EventsWithParameters = {
	[K in keyof EventsWithMatchers]: EventsWithMatchers[K] & { parameters: Parameters<EventsWithMatchers[K]["match"]> };
};

const events = Object.values(eventsWithMatchers);

type Event = ValueOf<EventsWithParameters>;

const fillEmbed = async (embed: Record<string, any>, match: string, fill: string) => {
	for (const key in embed) {
		if (typeof embed[key] === "string") {
			if (embed[key] === `${match}_image`) embed[key] = `https://crafthead.net/cube/${fill}.png`;
			else embed[key] = embed[key].replace(match, fill);
		} else fillEmbed(embed[key], match, fill);
	}
};

export const parseEvent = (string: string): Event | undefined => {
	for (const eventDef of events) {
		const match = string.replace(/\n|\r/g, "").match(eventDef.regex);
		if (match === null) continue;

		const event: Event = structuredClone(eventDef);
		event.parameters = {};

		const { replacers } = event;

		if (replacers === null) return event;

		for (let i = 0; i < replacers.length; i++) {
			// @ts-ignore I cbf dealing with all the casts needed to make this happy
			event.parameters[replacers[i].replaceAll("%", "")] = match[i + 1];
			if (event.send === SendEvent.Text) {
				(<string>event.text) = event.text.replace(replacers[i], match[i + 1]);
				continue;
			}
			fillEmbed(event.embed, replacers[i], match[i + 1]);
		}
		return event;
	}
};
