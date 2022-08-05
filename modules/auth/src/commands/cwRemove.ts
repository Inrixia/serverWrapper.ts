// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

import { moduleSettings } from "..";
import { cwParams } from "../lib/cwParams";
import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";

export const cwRemove: Command = async (message) => {
	const { provider, command, id, name } = await cwParams(message);

	if (moduleSettings[provider][id]?.allowedCommands?.[command] === undefined) throw new Error(`Command ${command} is not whitelisted for ${name}`);

	// @ts-expect-error In order for the delete to show in settings have to set to undefined
	moduleSettings[provider][id].allowedCommands[command] = undefined;
	return strOut(["Removed command ", [command, "cyanBright"], " from ", [name, "cyanBright"], "."]);
};
cwRemove.help = helpHelper({
	commandString: "~cwRemove",
	summary: "Removes given whitelisted commands from a role or user.",
	exampleArgs: [
		[["@DiscordUser", "redBright"], "~killModule"],
		[["@DiscordRole", "redBright"], "!tps"],
		[["Minecraft_user1873425", "redBright"], "~*"],
	],
});
