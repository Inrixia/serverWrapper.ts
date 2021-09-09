// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import Players from "../lib/Players";
import { flatOut, helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";
import { getWorldFolder } from "..";
import { cleanNBT, readNbt } from "../lib/nbt";

export const getSpawn: Command = async (message) => {
	const parsed = await readNbt<{ Data?: { SpawnX?: number; SpawnY?: number; SpawnZ?: number } }>(`${await getWorldFolder()}/level.dat`);
	return strOut([parsed.Data?.SpawnX, parsed.Data?.SpawnY, parsed.Data?.SpawnZ].join(" "));
};
getSpawn.help = helpHelper({
	commandString: "~getSpawn",
	summary: "Gets server spawn coords.",
});
