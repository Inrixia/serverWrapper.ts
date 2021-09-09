import fs from "fs/promises";

import { patchErr } from "@spookelton/wrapperHelpers/modul";
import { Metadata, NBT, NBTFormat, parse } from "prismarine-nbt";

export const cleanNBT = (nbt: any): any => {
	if (typeof nbt === "object") {
		for (const key in nbt) {
			if (key === "value") return cleanNBT(nbt.value);
			if (typeof nbt[key] === "object") nbt[key] = cleanNBT(nbt[key]);
		}
	}
	return nbt;
};

export function readNBT<T extends Record<string, any> = Record<string, any>>(path: string, dirty?: false): Promise<T>;
export function readNBT(path: string, dirty: true): Promise<{ parsed: NBT; type: NBTFormat; metadata: Metadata }>;
export async function readNBT<T extends Record<string, any> = Record<string, any>>(
	path: string,
	dirty?: boolean
): Promise<T | Promise<{ parsed: NBT; type: NBTFormat; metadata: Metadata }>> {
	let file;
	try {
		file = await fs.readFile(path);
	} catch (err) {
		throw patchErr(err, "Unable to read file!");
	}
	try {
		const nbt = await parse(file);
		if (dirty === true) return nbt;
		return cleanNBT(nbt.parsed) as unknown as T;
	} catch (err) {
		throw patchErr(err, "Unable to parse nbt!");
	}
}
