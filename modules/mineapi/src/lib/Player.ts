import got from "got";

class Player {
	private username?: string;
	private _uuid?: string;

	constructor(options: { username?: string; uuid?: string }) {
		if (options.username === undefined && options.uuid === undefined) throw new Error("UUID or Username must be provided when creating a player");
		this.username = options.username;
		this._uuid = options.uuid ? Player.makeDirtyUUID(options.uuid) : undefined;
	}

	/**
	 * uuid not seperated by dashes
	 */
	set uuid(uuid: string) {
		this._uuid = Player.makeDirtyUUID(uuid);
	}
	getUUID = async (): Promise<string> => {
		if (this._uuid) return this._uuid;
		if (this.username === undefined) throw new Error("Username must be set before getting UUID");
		const result: { id: string; name: string }[] = await got
			.post("https://api.mojang.com/users/profiles/minecraft", {
				json: [this.username],
				resolveBodyOnly: true,
			})
			.then(JSON.parse);
		if (result.length === 0) throw new Error("No UUID found for username");
		const [{ id, name }] = result;
		this.uuid = id;
		this.username = name;
		return this._uuid!;
	};

	getUsername = async (): Promise<string> => {
		if (this.username) return this.username;
		if (this._uuid === undefined) throw new Error("UUID must be set before getting username");
		const { name } = await got(`https://api.mojang.com/user/profile/${Player.makeCleanUUID(this._uuid)}`, { resolveBodyOnly: true }).then(JSON.parse);
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
