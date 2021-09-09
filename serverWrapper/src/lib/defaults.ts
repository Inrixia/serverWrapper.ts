import type { WrapperSettings } from "@spookelton/wrapperHelpers/types";

export const defaultWrapperSettings: WrapperSettings = {
	serverName: "",
	lastStartTime: 0,
	commandWorkingDirectory: "./",
	command: [],
	modules: {
		"@spookelton/command": {
			enabled: true,
		},
		"@spookelton/math": {
			enabled: true,
		},
		"@spookelton/discord": {
			enabled: true,
		},
		"@spookelton/auth": {
			enabled: true,
		},
		"@spookelton/stats": {
			enabled: false,
		},
		"@spookelton/mineapi": {
			enabled: true,
		},
	},
};
