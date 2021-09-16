// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";
import type { MessageEmbedOptions } from "discord.js";

import { thread, getCore } from "..";
import { helpHelper } from "@spookelton/wrapperHelpers/modul";
import { hex } from "@spookelton/wrapperHelpers/colors"
import { ColorKey } from "@spookelton/wrapperHelpers/types"

type TpsResponse = {
	dimensions: {
		dimId: string,
		dimName: string | null,
		tickTime: number,
		tps: number,
	}[],
	overall: {
		tickTime: number,
		tps: number,
	},
}

function parseOutput(input: RegExpMatchArray[]): TpsResponse {
	// We don't want the Overall tps to be parsed as a dimension, so remove it and store it for later
	const inputOverall = input.pop();
	if (!inputOverall) throw new Error("It seems like something bad happened I'll change this error later");

	const output = {
		dimensions: input.map(x => ({
			dimId: x[1].replace(/Dim  ?/, ""),
			dimName: x[2] === "null" ? null : x[2],
			tickTime: parseFloat(x[3]),
			tps: parseFloat(x[4]),
		})),
		overall: {
			tickTime: parseFloat(inputOverall[3]),
			tps: parseFloat(inputOverall[4]),
		}
	};

	return output;
}

function tpsToColor(tps: number): number {
	let colorName: ColorKey;
	if (tps < 10) {
		colorName = "red";
	} else if (tps < 15) {
		colorName = "yellow";
	} else {
		colorName = "green"
	}

	return parseInt(hex[colorName], 16)
}

export const tps: Command = async (message) => {
	const wrapperThread = await getCore();

	// Execute the "/forge tps" command
	await wrapperThread.serverStdin("forge tps\n");

	// Get the server's response to the command
	const result = await new Promise<TpsResponse>((resolve, reject) => {
		const results: RegExpMatchArray[] = [];

		// TODO: Make sure this format works for relevant minecraft versions.
		const regex = /\[\d{2}:\d{2}:\d{2}\] \[Server thread\/INFO\](?: \[minecraft\/DedicatedServer\])?: (Dim .+?:.+?|Dim [ -]?\d+?|Overall)(?: \((.+?)\))? ?: Mean tick time: ([-+]?[0-9]*\.?[0-9]+) ms. Mean TPS: ([-+]?[0-9]*\.?[0-9]+)/g

		const getMatchs = (lines: string) => {
			const matches = lines.matchAll(regex);
			for (let match of matches) {
				results.push(match)

				// The last line of the command output will have a dimension of Overall
				if (match[1] === "Overall") {
					thread.removeListener("serverStdout", getMatchs);
					resolve(parseOutput(results));
				}
			}
		}

		thread.on("serverStdout", getMatchs);
	});

	console.log(result)

	// Construct a custom message with info extracted from server output
	const embed: MessageEmbedOptions = {
		title: "Server TPS:",
		fields: [
			...result.dimensions.map(x => ({
				name: `${x.dimId} (${x.dimName})`,
				value: `**Mean tick time**: ${x.tickTime} ms\n**Mean TPS**: ${x.tps}`
			})),
			{
				name: "Overall",
				value: `**Mean tick time**: ${result.overall.tickTime} ms\n**Mean TPS**: ${result.overall.tps}`
			}
		],
		color: tpsToColor(result.overall.tps),
		timestamp: Date.now(),
	}

	return { discord: { embeds: [embed] } };
};
tps.help = helpHelper({
	commandString: "~tps",
	summary: "Returns the TPS of the server.",
});