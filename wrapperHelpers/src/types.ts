import type { MessageEmbedOptions } from "discord.js";
import type { mc } from "./colors";
import type { ValueOf } from "@inrixia/helpers/ts";

export type LogTo = {
	discord?: number;
	minecraft?: string | true;
};

export type Message = {
	string: string;
	logTo?: LogTo;
	args: Array<string>;
};

export type MinecraftOutputArray = Array<{
	text: string;
	color?: ValueOf<typeof mc>;
}>;

export type Output = {
	console?: string;
	minecraft?: string | MinecraftOutputArray;
	discord?: string | MessageEmbedOptions;
};
export type DiscordEmbed = MessageEmbedOptions;

export type Command = {
	(message: Message): Promise<Output | Output[]>;
	help: Output & { summary: string };
};

export type ModuleInfo = {
	commands?: Record<string, Command["help"]>;
	module?: string;
	persistent?: boolean;
	color: keyof typeof mc;
	description: string;
};
