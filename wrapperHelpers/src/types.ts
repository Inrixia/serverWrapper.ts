import type { MessageEmbedOptions } from "discord.js";
import type { mc } from "./colors";
import type { ValueOf } from "@inrixia/helpers/ts";

import type { ThreadModule } from "@inrixia/threads";

export type LogTo = {
	discord?: string;
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
	description?: string;
};

// TODO: Get event types for stdin/stdout mapped to thsi
export type WrapperModule = ThreadModule<{}>;

export type CoreExports = { getRunningModules: () => ModuleInfo[]; serverStdin: (string: string) => boolean };
