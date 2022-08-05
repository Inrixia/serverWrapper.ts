// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import { getCore, getStatus } from ".."
import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";
import { hex } from "@spookelton/wrapperHelpers/colors";


export const list: Command = async (message) => {
	const core = await getCore();
	if (!await core.serverStarted()) return strOut("Server is still starting! Please wait...", "red");

	// TODO: Make sure samplePlayers includes ALL players
	const serverStatus = await getStatus();
	const { maxPlayers, onlinePlayers, samplePlayers } = serverStatus;

	const titleMessage = `There are ${onlinePlayers}/${maxPlayers} players online:`;
	const onlineMessage = samplePlayers?.length
						  ? samplePlayers.map(player => player.name).join(", ")
						  : "It is quite lonely.";

	// TODO: Make better formatting. Show more detailed userinfo (e.g. user head, icon).
	return {
		minecraft: `${titleMessage} ${onlineMessage}`,
		console: `${titleMessage} ${onlineMessage}`,
		discord: {embeds: [{
			title: titleMessage,
			description: onlineMessage,
			timestamp: new Date().toISOString(),
			color: parseInt(hex.green, 16),
		}]}
	};
};
list.help = helpHelper({
	commandString: "~list",
	summary: "Lists the current users on the server.",
});