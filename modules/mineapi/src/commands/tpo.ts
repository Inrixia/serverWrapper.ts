// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import { createWriteStream } from "fs";
import { writeUncompressed } from "prismarine-nbt";

import { readNBT } from "../lib/nbt";
import { Players } from "../lib/Players";
import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";
import { getWorldFolder } from "..";

export const tpo: Command = async (message) => {
	const username = message.args[0];
	if (username === undefined) throw new Error("No username provided");

	const [x, y, z] = message.args.slice(1).map((v) => +v);
	if (x === undefined || y === undefined || z === undefined) throw new Error("3 coordinates must be provided!");

	const playerDataFile = `${await getWorldFolder()}/playerdata/${await Players.getUUID(username)}.dat`;
	const { parsed, type } = await readNBT(playerDataFile, true);

	const pos = (parsed.value?.Pos?.value as any)?.value;
	if (!isPosition(pos)) throw new Error("Unable to read position from playerdata!");

	[pos[0], pos[1], pos[2]] = [x, y, z];

	// Write it back
	const outBuffer = createWriteStream(playerDataFile);
	const newBuf = writeUncompressed(parsed, type);
	outBuffer.write(newBuf);
	await new Promise((res) => outBuffer.end(res));
	return strOut([[`${username}'s position has been set to`], ...([x, y, z].map((coord) => [coord, "blueBright"]) as any)]);
};
tpo.help = helpHelper({
	commandString: "~tpo",
	summary: "Set the coordinates of a given player in their playerdata.",
	exampleArgs: [["<username> 0 100 0"]],
});

const isPosition = (pos: any): pos is [number, number, number] => pos !== undefined && Array.isArray(pos) && pos.length === 3;
