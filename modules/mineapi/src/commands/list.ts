// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import { getStatus } from ".."
import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";

export const list: Command = async (message) => {
	const serverStatus = await getStatus();

	const { maxPlayers, onlinePlayers, samplePlayers } = serverStatus;
	const onlineMessage = samplePlayers?.length
						  ? `:\n${samplePlayers.map(x => x.name).join(", ")}`
						  : ".\nIt is quite lonely.";

	const outputMessage = `There are ${onlinePlayers}/${maxPlayers} players online` + onlineMessage;

	// TODO: Make better formatting.
	// Includes perhaps showing more detailed userinfo, icon, etc.
	// TODO: Do I have to do something to handle console/ingame output? Ideally there should be no output there, or
	// just the raw command output? Or maybe we can use the formatted output as well.
	return {
		console: outputMessage,
		minecraft: outputMessage,
		discord: {
			embeds: [
				{
					title: outputMessage,
					timestamp: Date.now(),
					author: {
						name: "",
						icon_url: "https://cdn.discordapp.com/avatars/300050030923087872/b85c91512bf80b884a75548e71b9a817.webp"
					},
				},
			],
		}
	};
};
list.help = helpHelper({
	commandString: "~list",
	summary: "Lists the current users on the server.",
});