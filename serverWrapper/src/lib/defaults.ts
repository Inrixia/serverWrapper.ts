import type { WrapperSettings } from "./types";

export const defaultWrapperSettings: WrapperSettings = {
	serverName: "",
	lastStartTime: 0,
	commandWorkingDirectory: "./",
	command: [],
	modules: {
		"@spookelton/command": {
			enabled: true,
			persistent: true,
			color: "greenBright",
			description: "Handles all commands.",
		},
	},
};
