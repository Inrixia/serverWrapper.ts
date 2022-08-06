import type { Output, ColorfulString, ColorKey } from "../types";

import { hex } from "../colors";
import * as colorize from "./colorize";

export const strOut = (string: ColorfulString[] | string, discordColor?: ColorKey): Output => {
	if (typeof string === "string") {
		return {
			console: string,
			minecraft: string,
			discord: {
				embeds: [
					{
						color: discordColor ? parseInt(hex[discordColor], 16) : undefined,
						title: string,
						timestamp: new Date().toISOString(),
					},
				],
			},
		};
	}
	return {
		console: string.map(colorize.console()).join(" "),
		minecraft: string.map(colorize.minecraft()),
		discord: {
			embeds: [
				{
					color: discordColor ? parseInt(hex[discordColor], 16) : undefined,
					title: string.map((val) => (typeof val === "string" ? val : val[0])).join(" "),
					timestamp: new Date().toISOString(),
				},
			],
		},
	};
};
