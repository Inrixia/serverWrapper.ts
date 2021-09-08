import pidusage from "pidusage";
import { cpus } from "os";
import { promisify } from "util";
const sleep = promisify(setTimeout);

// Import Types
import type { ThreadModule } from "@inrixia/threads";
import type { CoreExports } from "@spookelton/wrapperHelpers/types";

import { buildModuleInfo, setTitleBar } from "@spookelton/wrapperHelpers/modul";
// Export moduleInfo
export const moduleInfo = buildModuleInfo({
	color: "yellowBright",
	description: "Displays server stats on console window.",
});

const thread = (module.parent as ThreadModule).thread;

export const stats: {
	pid: number;
	uptime: number;
	timeToStart: number;
	memoryUsage: number;
	cpuUsage: number;
} = {
	pid: 0,
	uptime: 0,
	timeToStart: 0,
	memoryUsage: 0,
	cpuUsage: 0,
};

const cores = cpus().length;

thread.require<CoreExports>("@spookelton/serverWrapper").then(async (wrapperCore) => {
	const getPid = async (): Promise<number> => {
		const pid = await wrapperCore.serverPid();
		if (pid !== undefined) return pid;
		await sleep(250);
		return getPid();
	};
	stats.pid = await getPid();

	const startTime = await wrapperCore.startTime();

	let serverStarted = await wrapperCore.serverStarted();
	thread.once("serverStarted", () => (serverStarted = true));

	const { serverName, lastStartTime } = await wrapperCore.settings();

	setInterval(async () => {
		const usage = await pidusage(stats.pid);
		stats.uptime = Date.now() - startTime;
		if (!serverStarted) stats.timeToStart = lastStartTime - stats.uptime;

		stats.memoryUsage = usage.memory / 1024 / 1024;
		stats.cpuUsage = usage.cpu / cores;

		const tts = serverStarted ? "" : `  |  Time to start: ${~~(stats.timeToStart / 1000)}s`;
		setTitleBar(
			`${serverName}${tts}  |  PID: ${stats.pid}  |  MEM: ${stats.memoryUsage.toFixed(2)}MB  |  CPU: ${stats.cpuUsage}%  |  Uptime: ${~~(stats.uptime / 1000)}s`
		);
	}, 1000);
});
