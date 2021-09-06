import readline from "readline";

import { commandCompletions } from "./commandCompletions";
import { exitHandler } from "..";

export const consoleHandler = (onLine: (char: string) => void) => {
	// Setup console handling
	readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true,
		historySize: 10000,
		prompt: "",
	});
	process.stdin.setRawMode(true);

	let consoleInput: string[] = [];
	const consoleHistory: string[][] = [];
	let consoleHistoryIndex = 0;
	let consoleIndex = 0;

	process.stdin.on("keypress", (char, key) => {
		if (key.ctrl && key.name === "c") {
			exitHandler().then(process.exit);
			return;
		}
		switch (key.name) {
			case "return":
				onLine(consoleInput.join(""));
				consoleHistory.push(consoleInput);
				consoleHistoryIndex = consoleHistory.length;
				consoleInput = [];
				consoleIndex = 0;
				break;
			case "backspace":
				consoleInput.splice(consoleIndex - 1, 1);
				consoleIndex--;
				break;
			case "delete":
				consoleInput.splice(consoleIndex, 1);
				break;
			case "left":
				if (consoleIndex !== 0) consoleIndex--;
				break;
			case "right":
				if (consoleIndex < consoleInput.length) consoleIndex++;
				break;
			case "up":
				if (consoleHistoryIndex !== 0) consoleHistoryIndex--;
				consoleInput = consoleHistory[consoleHistoryIndex];
				consoleIndex = consoleHistory[consoleHistoryIndex].length;
				break;
			case "down":
				if (consoleHistoryIndex !== consoleHistory.length - 1) consoleHistoryIndex++;
				consoleInput = consoleHistory[consoleHistoryIndex];
				consoleIndex = consoleHistory[consoleHistoryIndex].length;
				break;
			case "end":
				consoleIndex = consoleInput.length;
				break;
			case "home":
				consoleIndex = 0;
				break;
			case "tab": {
				const hits = commandCompletions.filter((command) => command.toLowerCase().startsWith(consoleInput.join("").toLowerCase()));
				if (hits.length === 1) {
					consoleInput = hits[0].split("");
					consoleIndex = consoleInput.length;
				} else {
					process.stdout.cursorTo(0);
					process.stdout.clearLine(0);
					console.log(hits.join(", "));
				}
				break;
			}
			default:
				consoleInput.splice(consoleIndex, 0, char);
				consoleIndex++;
				break;
		}
		process.stdout.cursorTo(0);
		process.stdout.clearLine(0);
		process.stdout.write(consoleInput.join(""));
		process.stdout.cursorTo(consoleIndex);
	});
};
