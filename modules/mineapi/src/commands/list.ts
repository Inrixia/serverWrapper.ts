// Import Types
import { Command, CoreExports } from "@spookelton/wrapperHelpers/types";
import type { ThreadModule } from "@inrixia/threads";

import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";

export const list: Command = async (message) => {
	const thread = (module.parent!.parent!.parent as ThreadModule).thread;
	const wrapperThread = await thread.require<CoreExports>("@spookelton/serverWrapper");

	// Execute the list command
	await wrapperThread.serverStdin("list\n");

	// Get the server's response to the command
	const result = await new Promise<RegExpMatchArray>((resolve, reject) => {
		// TODO: Make sure this format works for relevant minecraft versions.
		const regex = new RegExp(String.raw
			`\[\d+:\d+:\d+\] \[Server thread\/INFO\]: There are (\d+) of a max of (\d+) players online: (.+( ,)?)*`
		);

		const getMatch = (line: string) => {
			const maybeMatch = line.match(regex);

			if (maybeMatch === null) return;

			thread.removeListener("serverStdout", getMatch);
			resolve(maybeMatch);
		}

		thread.on("serverStdout", getMatch);
	});

	// Construct a custom message with info extracted from server output
	const numOnline = result[1];
	const numMax = result[2];
	const onlinePlayers: string | undefined = result[3];
	const onlinePlayersMessage = onlinePlayers ? `:\n${onlinePlayers}` : ".\nIt is quite lonely.";

	const outputMessage = `There are ${numOnline}/${numMax} players online${onlinePlayersMessage}`;

	// TODO: Make better formatting.
	// TODO: Do I have to do something to handle console/ingame output? Ideally there should be no output there, or
	// just the raw command output? Or maybe we can use the formatted output as well.
	return strOut(outputMessage);
};
list.help = helpHelper({
	commandString: "~list",
	summary: "Lists the current users on the server.",
});