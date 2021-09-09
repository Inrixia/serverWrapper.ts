import chalk from "chalk";
import { mc, hex } from "../colors";

export const flattenObject = (ob: Record<string, any>) => {
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

export const flatOutput = (ob: Record<string, any> | undefined) => {
	if (ob === undefined)
		return {
			console: "undefined",
			minecraft: [{ text: "undefined" }],
			discord: {
				color: parseInt(hex.cyan, 16),
				description: '```json\n"undefined"```',
				timestamp: Date.now(),
			},
		};
	if (typeof ob !== "object")
		return {
			console: ob,
			minecraft: [{ text: ob }],
			discord: {
				color: parseInt(hex.cyan, 16),
				description: `\`\`\`json\n${ob}\`\`\``,
				timestamp: Date.now(),
			},
		};
	const flatObject = flattenObject(ob);
	return {
		console: Object.entries(flatObject)
			.map(([key, value]) => chalk`{cyan ${key}}: {red ${value}}`)
			.join("\n"),
		minecraft: Object.entries(flatObject).flatMap(([key, value]) => [
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
			description: "```json\n" + JSON.stringify(flatObject, null, 2) + "```",
			timestamp: Date.now(),
		},
	};
};
