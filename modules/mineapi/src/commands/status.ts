import chalk from "chalk";

// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";
import { mc, hex } from "@spookelton/wrapperHelpers/colors";

import { getStatus } from "../";

const flattenObject = (ob: Record<string, any>) => {
	const toReturn: Record<string, any> = {};
	for (const key in ob) {
		if (typeof ob[key] == "object") {
			const flatObject = flattenObject(ob[key]);
			for (const flatKey in flatObject) {
				toReturn[key + "." + flatKey] = flatObject[flatKey];
			}
		} else toReturn[key] = ob[key];
	}
	return toReturn;
};
export const status: Command = async (message) => {
	const pingInfo = await getStatus();
	const flattenedPingInfo = flattenObject(pingInfo);
	return {
		console: Object.entries(flattenedPingInfo)
			.map(([key, value]) => chalk`{cyan ${key}}: {red ${value}}`)
			.join("\n"),
		minecraft: Object.entries(flattenedPingInfo).flatMap(([key, value]) => [
			{
				text: key,
				color: mc.cyan,
			},
			{
				text: "",
			},
			{
				text: value,
				color: mc.red,
			},
		]),
		discord: {
			color: parseInt(hex.cyan, 16),
			title: `Status`,
			description: "```json\n" + JSON.stringify(status, null, 2) + "```",
			timestamp: Date.now(),
		},
	};
};
status.help = {
	summary: "Fetches server status.",
	console: chalk`{white Fetches server status.}Example: {yellow ~status}`,
	minecraft: [
		{
			text: `Fetches server status. `,
			color: "white",
		},
		{
			text: `Example: `,
			color: "gray",
		},
		{
			text: `~status`,
			color: "gold",
		},
	],
	discord: {
		title: "Fetches server status",
		description: "~ping",
		color: parseInt(hex.orange, 16),
		timestamp: Date.now(),
		fields: [
			{
				name: "Description",
				value: "Fetches server status.",
			},
			{
				name: "Example",
				value: "**~ping**",
			},
		],
	},
};
