import fs from "fs/promises";

import { patchErr } from "@spookelton/wrapperHelpers/modul";
import { NBT, parse, writeUncompressed } from "prismarine-nbt";

export const cleanNBT = (nbt: any): any => {
	if (typeof nbt === "object") {
		for (const key in nbt) {
			if (key === "value") return cleanNBT(nbt.value);
			if (typeof nbt[key] === "object") nbt[key] = cleanNBT(nbt[key]);
		}
	}
	return nbt;
};

export const readNbt = async <T extends Record<string, unknown> = {}>(path: string, dirty?: boolean): Promise<T & NBT> => {
	let file;
	try {
		file = await fs.readFile(path);
	} catch (err) {
		throw patchErr(err, "Unable to read file!");
	}
	try {
		const nbt = (await parse(file)).parsed;
		if (dirty === true) return nbt as unknown as T & NBT;
		return cleanNBT(nbt) as unknown as T & NBT;
	} catch (err) {
		throw patchErr(err, "Unable to parse nbt!");
	}
};
