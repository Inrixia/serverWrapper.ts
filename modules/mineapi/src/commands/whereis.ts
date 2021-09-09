// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import { readNBT } from "../lib/nbt";
import Players from "../lib/Players";
import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";
import { getWorldFolder } from "..";

export const whereis: Command = async (message) => {
	const username = message.args[0];
	if (username === undefined) throw new Error("No username provided");
	const { Pos } = await readNBT(`${await getWorldFolder()}/playerdata/${await Players.getUUID(username)}.dat`);
	return strOut([[username, "redBright"], "is at", ...Pos.map((v: number) => [~~v, "blueBright"])]);
};
whereis.help = helpHelper({
	commandString: "~whereis",
	summary: "Fetch player position from playerdata.",
	exampleArgs: [["<username>"]],
});
