// Server Wrapper - By @Inrix \\

// Import core packages
import path from "path";
import db from "@inrixia/db";
import chalk from "chalk";
import { spawn } from "child_process";

// Import and Promisify Terminate
import terminateCallback from "terminate";
import { promisify } from "util";
const terminate = promisify(terminateCallback);

// Import Handlers
import { consoleHandler } from "./lib/keyPressHandler";
import WrapperModule from "./lib/WrapperModule";

// Import Commands
import * as commands from "./commands";
export * from "./commands";

// Import defaults
import { defaultWrapperSettings } from "./lib/defaults";

// Import Types
import type { WrapperSettings, ColorMatchers } from "./lib/types";
import type { ChildProcessWithoutNullStreams } from "child_process";
import type { ModuleInfo } from "@spookelton/wrapperHelpers/types";

import { buildModuleInfo } from "@spookelton/wrapperHelpers/modul";
// Export Wrapper core moduleInfo
export const moduleInfo = buildModuleInfo({
	commands,
	module: "@spookelton/serverWrapper",
	description: "Wrapper core.",
	color: "cyan",
});

export const wrapperSettings = db<WrapperSettings>("./_db/wrapperSettings.json", {
	forceCreate: true,
	updateOnExternalChanges: true,
	pretty: true,
	template: defaultWrapperSettings,
});
wrapperSettings.serverName = path.basename(process.cwd());

process.on("SIGTSTP", () => console.log("Caught SIGTSTP, Dont use Ctrl-Z."));

const colorMatchers: ColorMatchers = [
	// "[" Must go first to avoid replacing color codes
	{ match: new RegExp("\\[", "g"), replace: chalk`{blackBright [}` },
	{ match: new RegExp("\\]", "g"), replace: chalk`{blackBright ]}` },
	{ match: new RegExp("Server thread", "g"), replace: chalk`{greenBright Server thread}` },
	{ match: new RegExp("INFO", "g"), replace: chalk`{cyan INFO}` },
	{ match: new RegExp("WARN", "g"), replace: chalk`{redBright WARN}` },
	{ match: new RegExp("ERROR", "g"), replace: chalk`{red ERROR}` },
	{ match: new RegExp("FATAL", "g"), replace: chalk`{red FATAL}` },
	{ match: new RegExp("FML", "g"), replace: chalk`{magentaBright FML}` },
];
const color = (string: string) => {
	for (const colors of colorMatchers) string = string.replace(colors.match, colors.replace);
	process.stdout.write("\r" + string);
};

let server: ChildProcessWithoutNullStreams | undefined;

// Expose wrapperCore to threads
import { Thread } from "@inrixia/threads/Thread";

export const serverStdin = (string: string): boolean => server !== undefined && server.stdin.write(string);

export const getRunningModules = (): ModuleInfo[] => [
	...(WrapperModule.runningModules()
		.map((module) => module.moduleInfo)
		.filter((moduleInfo) => moduleInfo !== undefined) as ModuleInfo[]),
	moduleInfo,
];

Thread.newProxyThread("@spookelton/serverWrapper", module.exports);

export const exitHandler = async () => {
	if (server?.pid) await terminate(server.pid);
	return 0;
};
process.on("beforeExit", exitHandler);
process.on("uncaughtException", async (...args) => {
	console.log(...args);
	await exitHandler();
	process.exit();
});

export let serverStarted = false;

/*
/ START
*/
(async () => {
	await WrapperModule.loadModules(wrapperSettings.modules);

	const serverStartTime = Date.now();

	console.log(
		chalk`{cyanBright Starting server...} ${wrapperSettings.lastStartTime ? chalk`Last start took: {cyanBright ${wrapperSettings.lastStartTime}}ms` : ""}\n`
	);
	if (wrapperSettings.command.length === 0) {
		console.log(
			chalk`{redBright Hey! wrapperSettings.command is empty...}\nPlease specify a command to start the server in wrapperSettings\nFor example: "command": ["java", "-jar", "minecraft.jar"]`
		);
		process.exit();
	}
	const command: string = wrapperSettings.command[0];
	const args: string[] = wrapperSettings.command.slice(1);
	server = spawn(command, args, { detached: false, cwd: wrapperSettings.commandWorkingDirectory });
	// Server error handling
	server.on("error", (err) => {
		console.log(chalk`{redBright An error occoured while attempting to start!}`);
		throw err;
	});
	server.stderr.on("data", (err) => console.log(chalk`{redBright ${err}}`));

	let stdoutChannel = "serverStdoutPreStart";
	server.stdout.on("data", (string: string) => {
		color(string.toString()); // Write line to wrapper console
		if (!serverStarted) {
			if (string.includes("players online")) {
				// "list" command has completed, server is now online
				serverStarted = true;
				wrapperSettings.lastStartTime = Date.now() - serverStartTime;
				console.log(chalk`Server started in {cyanBright ${wrapperSettings.lastStartTime}}ms`);
				for (const module of Object.values(WrapperModule.runningModules())) module.thread!.emit("serverStarted", { startTime: wrapperSettings.lastStartTime });
				stdoutChannel = "serverStdout";
			}
		}
		for (const module of Object.values(WrapperModule.runningModules())) module.thread!.emit(stdoutChannel, string.toString());
	});
	server.stdin.write("list\n"); // Write list to the console so we can know when the server has finished starting'

	// Server shutdown handling
	server.on("exit", async (code) => {
		console.log(chalk`Server {redBright closed} with exit code: {cyanBright ${code}}\n{redBright Killing modules...}`);
		for (const module of Object.values(WrapperModule.loadedModules)) await module.kill(true);

		console.log(chalk`Wrapper shutdown {greenBright finished}... Exiting`);
		process.exit();
	});

	/*
	/ Wrapper Console Handling
	*/
	consoleHandler((string) => {
		// moduleEvent.emit("consoleStdout", trimmedString);;
		for (const module of Object.values(WrapperModule.runningModules())) module.thread!.emit("consoleStdin", string);
		if (string[0] !== "~" && string[0] !== "?" && server !== undefined) server.stdin.write(string + "\n");
	});
})();
