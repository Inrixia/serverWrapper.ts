// Import core packages
const { evaluate } = require("mathjs");

import { strOut, helpHelper } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const qm: Command = async (message) => {
	const question = message.args.join(" ");
	const answer = evaluate(question).toString();
	return strOut([
		[question, "whiteBright"],
		["=", "yellow"],
		[answer, "cyan"],
	]);
};
qm.help = helpHelper({
	commandString: "~qm",
	summary: "Accepts any math question and/or unit conversion.",
	exampleArgs: [["1+1"], ["1cm to inch"], ["1.2 * (2 + 4.5)"], ["sin(45 deg) ^ 2"], ["9 / 3 + 2i"], ["det([-1, 2; 3, 1])"]],
});
