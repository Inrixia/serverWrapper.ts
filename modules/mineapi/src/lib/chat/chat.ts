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

// Import types
import type { EventTranslation } from "./eventTranslations";
import type * as DiscordModule from "@spookelton/discord";




export const serverStdout = async (discordThread: typeof DiscordModule) => {
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
		// Get username from inbetween <> in text and remove the <>
		if (event.name === "PlayerMessage") {
			discordThread.sendWebhookMessage(event.embed.author.name, text);
		}
		if (event.send.embed) discordThread.sendWebhookEmbed(embed).catch(console.error);
	
	};
	
	return ;
} 
