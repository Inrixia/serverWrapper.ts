import type { Output, ColorfulString, ColorKey } from "../types";

import { hex } from "../colors";
import * as colorize from "./colorize";

export const strOut = (string: ColorfulString[], discordColor?: ColorKey): Output => {
	if (typeof string === "string") {
		return {};
	}
	return {
		console: string.map(colorize.console()).join(" "),
		minecraft: string.map(colorize.minecraft()),
		discord: {
			embeds: [
				{
					color: discordColor ? parseInt(hex[discordColor], 16) : undefined,
					title: string.map(([text]) => text).join(" "),
					timestamp: Date.now(),
				},
			],
		},
	};
};
