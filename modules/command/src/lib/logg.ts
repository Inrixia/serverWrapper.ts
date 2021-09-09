import { Output, LogTo } from "@spookelton/wrapperHelpers/types";
import { getWrapperThread, getDiscordThread } from "..";

export const logg = async (output: Output, logTo?: LogTo) => {
	if (output.console !== undefined && logTo?.console !== undefined) console.log(output.console);
	if (output.minecraft !== undefined && logTo?.minecraft !== undefined) {
		const wrapperThread = await getWrapperThread();
		if (typeof output.minecraft === "string") await wrapperThread.serverStdin(output.minecraft);
		else await wrapperThread.serverStdin(`tellraw ${logTo.minecraft} ${JSON.stringify(output.minecraft)}`);
	}
	if (output.discord && logTo?.discord) {
		const discordThread = await getDiscordThread();
		if (discordThread !== undefined) await discordThread.sendToChannel(logTo.discord.channelId, output.discord);
	}
};
