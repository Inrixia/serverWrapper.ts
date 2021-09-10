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
		"-XX:+ParallelRefProcEnabled",
		"-XX:MaxGCPauseMillis=200",
		"-XX:+UnlockExperimentalVMOptions",
		"-XX:+DisableExplicitGC",
		"-XX:+AlwaysPreTouch",
		"-XX:G1NewSizePercent=40",
		"-XX:G1MaxNewSizePercent=50",
		"-XX:G1HeapRegionSize=16M",
		"-XX:G1ReservePercent=20",
		"-XX:G1HeapWastePercent=5",
		"-XX:G1MixedGCCountTarget=4",
		"-XX:InitiatingHeapOccupancyPercent=20",
		"-XX:G1MixedGCLiveThresholdPercent=90",
		"-XX:G1RSetUpdatingPauseTimePercent=5",
		"-XX:SurvivorRatio=32",
		"-XX:+PerfDisableSharedMem",
		"-XX:MaxTenuringThreshold=1",
		"-Dusing.aikars.flags=https://mcflags.emc.gs",
		"-Daikars.new.flags=true",
		"-jar",
		"./server.jar",
		"nogui",
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
