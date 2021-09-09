// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import { flatOut, helpHelper } from "@spookelton/wrapperHelpers/modul";
import { getWorldFolder } from "..";
import { cleanNBT, readNBT } from "../lib/nbt";

export const leveldat: Command = async () => flatOut(cleanNBT(await readNBT(`${await getWorldFolder()}/level.dat`)), "level.dat.json");
leveldat.help = helpHelper({
	commandString: "~leveldat",
	summary: "Gets world level data.",
});
