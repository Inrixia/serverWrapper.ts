import { thread, getCore } from "..";

import { hex } from "@spookelton/wrapperHelpers/colors"
import { ColorKey } from "@spookelton/wrapperHelpers/types"


type dimInfo = {
	dimId: string,
	dimName: string | null,
	tickTime: number,
	tps: number,
};

type TpsResponse = {
	dimensions: dimInfo[],
	overall: {
		tickTime: number,
		tps: number,
	},
};


// TODO: Check for a "command not found error", if found reject
// TODO: Make sure this format works for relevant minecraft versions.
const tpsRegExp = /\[\d{2}:\d{2}:\d{2}\] \[Server thread\/INFO\](?: \[minecraft\/DedicatedServer\])?: (Dim .+?:.+?|Dim [ -]?\d+?|Overall)(?: \((.+?)\))? ?: Mean tick time: ([-+]?[0-9]*\.?[0-9]+) ms. Mean TPS: ([-+]?[0-9]*\.?[0-9]+)/g;

export function runTpsCommand(): Promise<TpsResponse> {
    return new Promise<TpsResponse>((resolve, reject) => {
		const results: RegExpMatchArray[] = [];

		const getMatches = (lines: string) => {
			const matches = lines.matchAll(tpsRegExp);

			for (let match of matches) {
				results.push(match);

				// The last line of the command output will have a dimension of Overall
				if (match[1] === "Overall") {
					thread.removeListener("serverStdout", getMatches);
					resolve(parseOutput(results));
				}
			}
		}

		thread.on("serverStdout", getMatches);

        // Double check if this fixes the problem where the response could come before I started listening
        getCore().then(wrapperThread => wrapperThread.serverStdin("forge tps\n"));
	});
}

function parseOutput(input: RegExpMatchArray[]): TpsResponse {
	// We don't want the Overall tps to be parsed as a dimension, so remove it and store it for later
	const overall = input.pop();
	if (!overall) throw new Error("Input match array is empty, possibly due to failure to parse server output.");

	return {
		dimensions: input.map(dimMatch => ({
			dimId: dimMatch[1].replace(/Dim  ?/, ""),  // Remove extra "Dim" text at start
			dimName: dimMatch[2] === "null" ? null : dimMatch[2],
			tickTime: +dimMatch[3],
			tps: +dimMatch[4],
		})),
		overall: {
			tickTime: +overall[3],
			tps: +overall[4],
		}
	};
}

export function tpsToColor(tps: number): number {
	let colorName: ColorKey;
	if (tps < 10) colorName = "red";
	else if (tps < 18) colorName = "yellow";
	else colorName = "green";

	return parseInt(hex[colorName], 16);
}

function capitalize(input: string): string {
	return input.charAt(0).toUpperCase() + input.slice(1);
}

export function formatDimension(dim: dimInfo): string {
    // TODO: I really need to look at this more so it's less bad
	let [modName, dimensionName] = dim.dimId.split(':', 2);
	let name;

	// If the main name isn't a dimension id, use it for dimension and mod names.
	if (isNaN(+modName)) {
		// Don't show "minecraft:" on vanilla dimensions
		name = modName === "minecraft" ? dimensionName : `${capitalize(modName)}: ${dimensionName}`;
	} else {
		// If it is an id, use the dimension name instead (1.12 compatability)
		name = dimensionName;
	}

	return `**${name}**:\n TPS: \`${dim.tps}\` • Tick Time: \`${dim.tickTime}\` ms`;
}