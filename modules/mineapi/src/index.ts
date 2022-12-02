export * from "./commands";
import * as commands from "./commands";

// Import core packages
import { buildModuleInfo, prepGetThread } from "@spookelton/wrapperHelpers/modul";
import { ThreadModule } from "@inrixia/threads";
import db from "@inrixia/db";
import props from "properties";
import mcServerUtils from "minecraft-server-util";
import { promisify } from "util";
import { serverStdout } from "./lib/chat/chat";
import { Players } from "./lib/Players";

import type * as DiscordModule from "@spookelton/discord";


const properties = promisify(props.parse);

// Threading
export const thread = (module.parent as ThreadModule<{ serverPid: () => Promise<number> }>).thread;
export const { getCore, getThread } = prepGetThread(thread);

type ModuleSettings = {
	ip: string;
	info: {
		enabled: boolean;
		infoChannels: string[];
	};
};

export const moduleSettings = db<ModuleSettings>("./_db/mineapi.json", {
	forceCreate: true,
	updateOnExternalChanges: true,
	pretty: true,
	template: {
		ip: "",
		info: {
			enabled: false,
			infoChannels: [],
		},
	},
});

// Only listen to serverStdout if chat is enabled
(async () => {
	const discord = await getThread<typeof DiscordModule>("@spookelton/discord");
	discord?.isChatModuleEnabed && thread.on("serverStdout", serverStdout);
})();


// Export moduleInfo
export const moduleInfo = buildModuleInfo({
	commands,
	color: "cyan",
	description: "All things minecraft.",
});

type JSON = Record<string, any>;

let commandWorkingDirectory: string | undefined;
export const getCommandWorkingDirectory = async () => {
	if (commandWorkingDirectory !== undefined) return commandWorkingDirectory;
	const wrapperThread = await getCore();
	return (commandWorkingDirectory = (await wrapperThread.settings()).commandWorkingDirectory);
};
let worldFolder: string;
export const getWorldFolder = async () => {
	if (worldFolder !== undefined) return worldFolder;
	const properties = await getProperties();
	return (worldFolder = `${(await getCommandWorkingDirectory()) || "."}/${properties?.["level-name"]}`);
};
export const getProperties = async (): Promise<JSON | undefined> => {
	const wrapperThread = await getCore();
	const { commandWorkingDirectory } = await wrapperThread.settings();
	return properties(`${commandWorkingDirectory + "/" || "./"}server.properties`, { path: true });
};
export const getStatus = async () => {
	if (moduleSettings.ip !== "") return mcServerUtils.status(moduleSettings.ip, { enableSRV: true });
	const port = (await getProperties())?.["server-port"] as number;
	return mcServerUtils.status("localhost", { port, enableSRV: false });
};
export const usernameToUUID = async (username: string) => await Players.getUUID(username);