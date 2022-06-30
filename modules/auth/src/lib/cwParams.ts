import { Message } from "@spookelton/wrapperHelpers/types";
import { getThread, MineAPIModule } from "..";

const unitLookups: Record<string, number> = {
	second: 1000,
	seconds: 1000,
	sec: 1000,
	secs: 1000,
	minute: 60 * 1000,
	minutes: 60 * 1000,
	min: 60 * 1000,
	mins: 60 * 1000,
	hour: 60 * 60 * 1000,
	hours: 60 * 60 * 1000,
	day: 24 * 60 * 60 * 1000,
	days: 24 * 60 * 60 * 1000,
	week: 7 * 24 * 60 * 60 * 1000,
	weeks: 7 * 24 * 60 * 60 * 1000,
	month: 30 * 24 * 60 * 60 * 1000,
	months: 30 * 24 * 60 * 60 * 1000,
	year: 365 * 24 * 60 * 60 * 1000,
	years: 365 * 24 * 60 * 60 * 1000,
};

export const cwParams = async (message: Message) => {
	const provider: "minecraft" | "discord" = message.logTo?.discord !== undefined ? "discord" : "minecraft";
	const command = message.args[0];
	if (command === undefined) throw new Error("Please specify a command.");

	let id: string;
	let name: string;
	id = name = message.args[1];
	switch (provider) {
		case "minecraft":
			{
				const mineAPIThread = await getThread<MineAPIModule>("@spookelton/mineapi");
				if (mineAPIThread === undefined) throw new Error("Unable to access the mineapi module.");
				id = await mineAPIThread.usernameToUUID(name);
			};
			break;
		case "discord":
			{
				// TODO: There is a case using role mentionable commands to break this, should be fixed sometime
				const mentions = message.logTo?.discord?.mentions;
				if (mentions === undefined) throw new Error("Please specify a user or role.");
				if (mentions.users.length !== 0) {
					const user = mentions.users[mentions.bot ? 1 : 0];
					id = user.id;
					name = user.username;
				}
				if (mentions.roles.length !== 0) {
					const role = mentions.roles[mentions.bot ? 1 : 0];
					id = role.id;
					name = role.name;
				}
			};
			break;
	}
	if (name === undefined || id === undefined) throw new Error("Please specify a User or Role.");

	const time = message.args[2];
	const units = message.args[3];

	if (units !== undefined && unitLookups[units] === undefined) {
		throw new Error(`"${units}" is not a supported time unit. Please use one of the following: ${Object.keys(unitLookups).join(", ")}`);
	}
	let expiresAt;
	if (time !== undefined) expiresAt = Number(time) * (units !== undefined ? unitLookups[units] : 1);

	return { provider, command, id, name, expiresAt };
};
