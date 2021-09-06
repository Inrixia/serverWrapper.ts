export type WrapperSettings = {
	serverName: string;
	lastStartTime: number;
	commandWorkingDirectory?: string;
	command: string[];
	modules: Record<string, WrapperModuleConfig>;
};

export type WrapperModuleConfig = {
	enabled: boolean;
	settings?: { [key: string]: unknown };
};

export type ColorMatchers = {
	match: string | RegExp;
	replace: string;
}[];
