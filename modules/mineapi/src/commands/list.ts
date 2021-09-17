// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import { getStatus } from ".."
import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";

export const list: Command = async (message) => {
	const serverStatus = await getStatus();

	const { maxPlayers, onlinePlayers, samplePlayers } = serverStatus;
	const onlineMessage = samplePlayers?.length
						  ? `:\n${samplePlayers.map(player => player.name).join(", ")}`
						  : ".\nIt is quite lonely.";

	const outputMessage = `There are ${onlinePlayers}/${maxPlayers} players online` + onlineMessage;

	// TODO: Make better formatting.
	// Show more detailed userinfo (e.g. user head, icon).
	return strOut(outputMessage)
};
list.help = helpHelper({
	commandString: "~list",
	summary: "Lists the current users on the server.",
});