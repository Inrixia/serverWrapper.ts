import type { APIEmbed, JSONEncodable, BaseMessageOptions } from "discord.js";
import type { ValueOf } from "@inrixia/helpers/ts";
import type { ThreadModule } from "@inrixia/threads";

import type { buildMessage } from "./discord";
import type { mc } from "./colors";

export type DiscordMessage = ReturnType<typeof buildMessage>;

export type LogTo = {
	console?: true;
	discord?: DiscordMessage;
	minecraft?: string | true;
};

export type Message = {
	string: string;
	logTo?: LogTo;
	args: Array<string>;
};

export type ColorfulString = [text: string, color?: ColorKey] | string;
export type ColorKey = keyof typeof mc;
export type MinecraftOutputArray = Array<{
	text: string;
	color?: ValueOf<typeof mc>;
}>;

export type Output = {
	console?: string;
	minecraft?: string | MinecraftOutputArray;
	discord?: string | BaseMessageOptions;
};
export type DiscordMessageOptions = BaseMessageOptions;
export type DiscordEmbed = APIEmbed | JSONEncodable<APIEmbed>;

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

export type WrapperSettings = {
	serverName: string;
	restartOnExit: boolean | -1;
	lastStartTime: number;
	commandWorkingDirectory?: string;
	command: string[];
	modules: Record<string, WrapperModuleConfig>;
};

export type WrapperModuleConfig = {
	enabled: boolean;
};

// TODO: Get event types for stdin/stdout mapped to thsi
export type WrapperModule = ThreadModule<{}>;

export type CoreExports = {
	startTime: number;
	serverStarted: boolean;
	getRunningModules: () => ModuleInfo[];
	serverStdin: (string: string) => boolean;
	serverPid: () => number | undefined;
	settings: () => Readonly<WrapperSettings>;
};
