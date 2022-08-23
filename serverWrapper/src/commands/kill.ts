import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";
import { exitHandler } from "..";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const kill: Command = async () => {
	await exitHandler();
	return strOut([["Killing server proces..."]], "red");
};
kill.help = helpHelper({
	commandString: "~kill",
	summary: "Kills the server process\nNote: This does not nicely shutdown, only use this if server has hung. Server will restart as normal if enabled",
});
