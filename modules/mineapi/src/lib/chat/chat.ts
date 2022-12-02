// let startEvent = mS.eventTranslation["Started"];
// 		modul.event.on("serverStarted", () => {
// 			modul.emit("serverEvent", {
// 				eventKey: "Started",
// 				event: startEvent,
// 				filled: {
// 					text: startEvent.send.text ? startEvent.text : null,
// 					embed: startEvent.send.embed ? startEvent.embed : null,
// 				},
// 			});
// 		});

import { events } from "./eventTranslations";
import { Players } from "../Players";
import { getThread, moduleSettings } from "../..";

// Import types
import type { EventTranslation } from "./eventTranslations";
import type * as DiscordModule from "@spookelton/discord";

const fillEmbed = async (embed: EventTranslation["embed"], match: string, fill: string) => {
	type Key = keyof typeof embed;
	for (let _key in embed) {
		// Stupid ts bullshit
		const key = _key as Key;
		if (typeof embed[key] === "string") {
			(embed[key] as string) = (embed[key] as string).replace(match, fill);
			if (embed[key] === `${fill}_image`) {
				(embed[key] as string) = `https://crafthead.net/cube/${fill}.png`;
			}
		} else if (typeof embed[key] === "object") await fillEmbed(embed[key] as any, match, fill);
	}
};

const handleEvent = async (match: RegExpMatchArray, event: EventTranslation) => {
	let text = event.text;
	let embed = { ...event.embed };
	const replacers = event.matchReplacers;
	if (replacers !== null) {
		for (let i = 0; i < replacers.length; i++) {
			text = text.replace(replacers[i], match[i + 1]);
			await fillEmbed(embed, replacers[i], match[i + 1]);
		}
	}
	const discord = await getThread<typeof DiscordModule>("@spookelton/discord");
	if (discord !== undefined) {
		// Get username from inbetween <> in text and remove the <>
		if (event.send.text) {
			const username = text.match(/<(.+?)>/)?.[1].replaceAll("*", "");
			discord.sendChatMessage(username, text);
		}
		if (event.send.embed) discord.sendChatMessage(undefined, undefined, embed ).catch(console.error);

	}
};
export const serverStdout = (string: string) => {
	for (const event of events) {
		const match = string.replace(/\n|\r/g, "").match(event.matchRegex);
		if (match !== null) {
			handleEvent(match, event).catch(console.error);
			break;
		}
	}
};
