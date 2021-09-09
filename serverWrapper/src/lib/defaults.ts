import type { WrapperSettings } from "@spookelton/wrapperHelpers/types";

export const defaultWrapperSettings: WrapperSettings = {
	serverName: "",
	lastStartTime: 0,
	commandWorkingDirectory: "./",
	command: [
		"java",
		"-Xms6G",
		"-Xmx6G",
		"-server",
		"-XX:+UseG1GC",
		"-Dsun.rmi.dgc.server.gcInterval=2147483646",
		"-XX:+UnlockExperimentalVMOptions",
		"-XX:MaxGCPauseMillis=50",
		"-XX:+DisableExplicitGC",
		"-XX:TargetSurvivorRatio=90",
		"-XX:G1NewSizePercent=30",
		"-XX:G1HeapRegionSize=32M",
		"-XX:G1MaxNewSizePercent=80",
		"-XX:G1MixedGCLiveThresholdPercent=35",
		"-XX:+ParallelRefProcEnabled",
		"-XX:ParallelGCThreads=8",
		"-XX:ConcGCThreads=8",
		"-jar",
		"./server.jar",
		"-nogui",
	],
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
			enabled: true,
		},
		"@spookelton/mineapi": {
			enabled: true,
		},
	},
};
