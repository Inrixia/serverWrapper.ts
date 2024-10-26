import { Output, LogTo, CoreExports } from "@spookelton/wrapperHelpers/types";
import { getThread, getCore } from "..";

import type { DiscordModule } from "../";

export const logg = async (output: Output, logTo?: LogTo) => {
	if (output.console !== undefined && logTo?.console !== undefined) console.log(output.console);
	if (output.minecraft !== undefined && logTo?.minecraft !== undefined) {
		const wrapperThread = await getCore();
		if (typeof output.minecraft === "string") await wrapperThread.serverStdin(output.minecraft);
		else await wrapperThread.serverStdin(`tellraw @a ${JSON.stringify(output.minecraft)}\n`);
	}
	if (output.discord && logTo?.discord) {
		const discordThread = await getThread<DiscordModule>("@spookelton/discord");
		if (discordThread !== undefined) await discordThread.sendToChannel(logTo.discord.channelId, output.discord);
	}
};
