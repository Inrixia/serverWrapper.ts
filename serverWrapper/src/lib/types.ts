// Import Types
import type { mc } from "@spookelton/wrapperHelpers/colors";

export type WrapperSettings = {
	serverName: string;
	lastStartTime: number;
	commandWorkingDirectory?: string;
	command: string[];
	modules: Record<string, WrapperModuleConfig>;
};

export type WrapperModuleConfig = {
	enabled: boolean;
	persistent: boolean;
	color: keyof typeof mc;
	description: string;
	settings?: { [key: string]: unknown };
};

export type ColorMatchers = {
	match: string | RegExp;
	replace: string;
}[];
