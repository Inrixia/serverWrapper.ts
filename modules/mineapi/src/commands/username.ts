// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import Players from "../lib/Players";
import { helpHelper, flatOut } from "@spookelton/wrapperHelpers/modul";

export const username: Command = async (message) => {
	const uuid = message.args[0];
	if (uuid === undefined) throw new Error("No uuid provided");
	return flatOut(await Players.getUsername(uuid));
};
username.help = helpHelper({
	commandString: "~username",
	summary: "Fetch username for given uuid.",
	exampleArgs: [["<uuid>"]],
});
