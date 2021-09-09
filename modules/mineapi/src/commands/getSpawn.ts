// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";
import { getWorldFolder } from "..";
import { readNBT } from "../lib/nbt";

export const getSpawn: Command = async (message) => {
	const parsed = await readNBT<{ Data?: { SpawnX?: number; SpawnY?: number; SpawnZ?: number } }>(`${await getWorldFolder()}/level.dat`);
	return strOut([parsed.Data?.SpawnX, parsed.Data?.SpawnY, parsed.Data?.SpawnZ].join(" "));
};
getSpawn.help = helpHelper({
	commandString: "~getSpawn",
	summary: "Gets server spawn coords.",
});
