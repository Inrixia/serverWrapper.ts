import got from "got";

import { patchErr } from "@spookelton/wrapperHelpers/modul";

export default class Player {
	private username?: string;
	private uuid?: string;

	constructor(options: { username?: string; uuid?: string }) {
		if (options.username === undefined && options.uuid === undefined) throw new Error("UUID or Username must be provided when creating a player");
		this.username = options.username;
		this.uuid = options.uuid ? Player.makeDirtyUUID(options.uuid) : undefined;
	}

	/**
	 * @returns Dirty player uuid (uuid seperated by dashes)
	 */
	getUUID = async (): Promise<string> => {
		if (this.uuid) return this.uuid;
		if (this.username === undefined) throw new Error("Username must be set before getting UUID");
		let result: { id: string; name: string }[];
		try {
			result = await got
				.post("https://api.mojang.com/profiles/minecraft", {
					json: [this.username],
					resolveBodyOnly: true,
				})
				.then(JSON.parse);
		} catch (err) {
			throw patchErr(err, `Unable to fetch UUID for ${this.username}`);
		}
		if (result.length === 0) throw new Error("No UUID found for username");
		const [{ id, name }] = result;
		this.uuid = Player.makeDirtyUUID(id);
		this.username = name;
		return this.uuid!;
	};

	/**
	 * @returns Player username
	 */
	getUsername = async (): Promise<string> => {
		if (this.username) return this.username;
		if (this.uuid === undefined) throw new Error("UUID must be set before getting username");
		let name: string;
		try {
			name = (await got(`https://api.mojang.com/user/profile/${Player.makeCleanUUID(this.uuid)}`, { resolveBodyOnly: true }).then(JSON.parse)).name;
		} catch (err) {
			throw patchErr(err, `Unable to fetch Username for ${this.uuid}`);
		}
		if (name === undefined) throw new Error("No username found for UUID");
		this.username = name;
		return this.username!;
	};

	/**
	 *  @returns uuid seperated by dashes
	 */
	static makeDirtyUUID = (cleanUUID: string) => {
		cleanUUID = Player.makeCleanUUID(cleanUUID);
		return [cleanUUID.slice(0, 8), "-", cleanUUID.slice(8, 12), "-", cleanUUID.slice(12, 16), "-", cleanUUID.slice(16, 20), "-", cleanUUID.slice(20)].join("");
	};

	/**
	 * @returns a uuid not seperated by dashes
	 */
	static makeCleanUUID = (dirtyUUID: string) => dirtyUUID.replace(/-/g, "");
}
