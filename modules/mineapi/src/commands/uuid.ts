// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import { Players } from "../lib/Players";
import { helpHelper, flatOut } from "@spookelton/wrapperHelpers/modul";

export const uuid: Command = async (message) => {
	const username = message.args[0];
	if (username === undefined) throw new Error("No username provided");
	return flatOut(await Players.getUUID(username));
};
uuid.help = helpHelper({
	commandString: "~uuid",
	summary: "Fetch uuid for given username.",
	exampleArgs: [["<username>"]],
});
