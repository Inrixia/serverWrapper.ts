import chalk from "chalk";

// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";
import { mc, hex } from "@spookelton/wrapperHelpers/colors";

import { getStatus } from "../";
import { flattenObject } from "../lib/flattenObject";
import { helpHelper } from "@spookelton/wrapperHelpers/modul";

export const status: Command = async (message) => {
	const pingInfo = await getStatus();
	// @ts-expect-error Delete this regardless
	delete pingInfo.rawResponse;
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
			description: "```json\n" + JSON.stringify(pingInfo, null, 2) + "```",
			timestamp: Date.now(),
		},
	};
};
status.help = helpHelper({
	commandString: "~status",
	summary: "Fetches server status.",
});
