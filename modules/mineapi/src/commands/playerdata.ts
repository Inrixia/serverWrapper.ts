// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import { cleanNBT, readPlayerdata } from "../lib/nbt";
import Players from "../lib/Players";
import { helpHelper, flatOut } from "@spookelton/wrapperHelpers/modul";

export const playerdata: Command = async (message) => {
	const username = message.args[0];
	if (username === undefined) throw new Error("No username provided");
	const { parsed } = await readPlayerdata(await Players.getUUID(username));
	return flatOut(cleanNBT(parsed));
};
playerdata.help = helpHelper({
	commandString: "~playerdata",
	summary: "Fetch playerdata for a given player.",
	exampleArgs: [["<username>"]],
});
