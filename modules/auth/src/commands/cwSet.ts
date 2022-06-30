import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

import { moduleSettings } from "..";
import { cwParams } from "../lib/cwParams";

export const cwSet: Command = async (message) => {
	const { provider, command, id, name, expiresAt } = await cwParams(message);

	moduleSettings[provider][id] ??= {
		name,
		allowedCommands: {},
	};

	moduleSettings[provider][id].allowedCommands[command] = {
		assignedAt: Date.now(),
		assignedBy: {
			name,
			id,
		},
	};

	if (expiresAt) moduleSettings[provider][id].allowedCommands[command].expiresAt = expiresAt;

	return strOut(["Whitelisted command ", [command, "cyanBright"], " for ", [name, "cyanBright"], "."]);
};
cwSet.help = helpHelper({
	commandString: "~cwSet",
	summary: "Whitelists given command for a Role or User.",
	exampleArgs: [
		["~listmodules", ["@DiscordUser", "redBright"], ["1 hour", "cyan"]],
		["!forge tps", ["@DiscordRole", "redBright"]],
		["!*", ["Minecraft_user1873425", "redBright"], "5.2 minutes"],
	],
});
