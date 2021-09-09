import chalk from "chalk";
import { mc, hex } from "../colors";

import type { ColorKey, Command, Output } from "../types";

type HelpHelperOptions = {
	commandString: string;
	summary: string;
	exampleArgs?: ([text: string, color?: ColorKey] | string)[][];
};
export const helpHelper = ({ summary, commandString, exampleArgs }: HelpHelperOptions): Command["help"] => {
	exampleArgs ??= [];
	exampleArgs = exampleArgs.map((example) => example.map((arg) => (typeof arg === "string" ? [arg] : arg)));
	const hasExamples = exampleArgs.length !== 0;
	const exampleString = exampleArgs
		.map((example) => chalk`{yellow ${commandString}} ${example.map(([text, color]) => chalk`{${color || "blueBright"} ${text}}`).join(" ")}`)
		.join("\n");

	const s = exampleArgs.length > 1 ? "s" : "";

	let console = chalk`{whiteBright ${summary}}`;
	let minecraft: Output["minecraft"] = [
		{
			text: summary,
			color: mc.white,
		},
	];
	if (hasExamples) {
		console += `\nExample${s}:\n${exampleString}`;
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
				...example.map(([text, color]) => ({ text: text as string, color: mc[(color || "blueBright") as ColorKey] })),
			])
		);
	}
	return {
		summary,
		console,
		minecraft,
		discord: {
			title: commandString.slice(1),
			description: summary,
			color: parseInt(hex.redBright, 16),
			timestamp: Date.now(),
			fields: hasExamples
				? [
						{
							name: `Example${s}`,
							value: exampleArgs.map((example) => `**${commandString}** ${example.map((arg) => arg[0]).join(" ")}`).join(`\n`),
						},
				  ]
				: undefined,
		},
	};
};
