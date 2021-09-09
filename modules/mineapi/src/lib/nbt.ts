import fs from "fs/promises";

import { patchErr } from "@spookelton/wrapperHelpers/modul";
import { parse, writeUncompressed } from "prismarine-nbt";
import { getWorldFolder } from "..";

export const cleanNBT = (nbt: any): any => {
	if (typeof nbt === "object") {
		for (const key in nbt) {
			if (key === "value") return cleanNBT(nbt.value);
			if (typeof nbt[key] === "object") nbt[key] = cleanNBT(nbt[key]);
		}
	}
	return nbt;
};

export const readPlayerdata = async (uuid: string) => {
	let file;
	try {
		file = await fs.readFile(`${await getWorldFolder()}/playerdata/${uuid}.dat`);
	} catch (err) {
		throw patchErr(err, "Unable to read playerdata!");
	}
	try {
		return parse(file);
	} catch (err) {
		throw patchErr(err, "Unable to parse playerdata!");
	}
};
