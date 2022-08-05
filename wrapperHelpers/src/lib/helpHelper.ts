import chalk from "chalk";
import { mc, hex } from "../colors";

import type { Command, Output, ColorfulString } from "../types";

import * as colorize from "./colorize";

type HelpHelperOptions = {
	commandString: string;
	summary: string;
	exampleArgs?: ColorfulString[][];
};
export const helpHelper = ({ summary, commandString, exampleArgs }: HelpHelperOptions): Command["help"] => {
	exampleArgs ??= [];
	exampleArgs = exampleArgs.map((example) => example.map((arg) => (typeof arg === "string" ? [arg] : arg)));
	const hasExamples = exampleArgs.length !== 0;

	const s = exampleArgs.length > 1 ? "s" : "";

	let console = chalk`{whiteBright ${summary}}`;
	let minecraft: Output["minecraft"] = [
		{
			text: summary,
			color: mc.white,
		},
	];
	if (hasExamples) {
		console += `\nExample${s}:\n${exampleArgs
			.map((example) => chalk`{yellow ${commandString}} ${example.map(colorize.console("blueBright")).join(" ")}`)
			.join("\n")}`;
		minecraft.push(
			{
				text: `Example${s}:\n`,
				color: mc.white,
			},
			...exampleArgs.flatMap((example) => [
				{
					text: commandString,
					color: mc.yellow,
				},
				...example.map(colorize.minecraft("blueBright")),
			])
		);
	}
	return {
		summary,
		console,
		minecraft,
		discord: {
			embeds: [
				{
					title: commandString.slice(1),
					description: summary,
					color: parseInt(hex.redBright, 16),
					timestamp: new Date().toISOString(),
					fields: hasExamples
						? [
								{
									name: `Example${s}`,
									value: exampleArgs.map((example) => `**${commandString}** ${example.map(([text]) => text).join(" ")}`).join(`\n`),
								},
						  ]
						: undefined,
				},
			],
		},
	};
};
