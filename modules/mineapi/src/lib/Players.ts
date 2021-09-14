import { Player } from "./Player";

export class Players {
	private static usernames: Record<string, Player> = {};
	private static uuids: Record<string, Player> = {};
	public static getPlayer(username: string): Player {
		if (Players.usernames[username] !== undefined) return Players.usernames[username];
		else return (Players.usernames[username] = new Player({ username }));
	}
	public static getPlayerByUUID(uuid: string): Player {
		if (Players.uuids[uuid] !== undefined) return Players.uuids[uuid];
		else return (Players.uuids[uuid] = new Player({ uuid }));
	}

	/**
	 * @returns Dirty player uuid (uuid seperated by dashes)
	 */
	public static getUUID = (username: string): Promise<string> => this.getPlayer(username).getUUID();

	/**
	 * @returns Player username
	 */
	public static getUsername = (uuid: string): Promise<string> => this.getPlayerByUUID(uuid).getUsername();
}
