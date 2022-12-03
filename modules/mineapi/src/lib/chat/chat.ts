import { parseEvent, EventName, SendEvent } from "./eventTranslations";

// Import types
import type * as DiscordModule from "@spookelton/discord";
import type { RequiredThread } from "@inrixia/threads";


export const onServerStdout = (discordThread: RequiredThread<typeof DiscordModule>) => (stdout: string) => {
	const event = parseEvent(stdout);
	if (event === undefined) return;
	// console.log(event.name, typeof event.name, EventName.PlayerMessage, typeof EventName.PlayerMessage, event.name === EventName.PlayerMessage);
	if (event.name === EventName.PlayerMessage) return discordThread.sendWebhookMessage(event.text, event.parameters.username).catch(console.error);

	if (event.send === SendEvent.Embed) return discordThread.sendWebhookEmbed(event.embed).catch(console.error);
	// if (event.send === SendEvent.Text) return discordThread.sendWebhookMessage(event.text).catch(console.error);
}