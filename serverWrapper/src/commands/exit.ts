import { wrapperSettings } from "..";
import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";
import { serverStdin } from "../";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const exit: Command = async (message) => {
	const command = message.args[0];
	if (command === undefined) throw new Error("No command specified.");
	wrapperSettings.restartOnExit = -1;
	serverStdin(command + "\n");
	return strOut([["Stopping server using command "], [command, "redBright"]], "red");
};
exit.help = helpHelper({
	commandString: "~exit",
	summary: "Stops the server using the given command and does not restart\nNote: This will set auto restart to true after exiting",
	exampleArgs: [["stop"]],
});
