// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import { getStatus } from "../";
import { helpHelper, flatOut } from "@spookelton/wrapperHelpers/modul";

export const status: Command = async (message) => {
	const pingInfo = await getStatus();
	// @ts-expect-error Delete this regardless
	delete pingInfo.rawResponse;
	return flatOut(pingInfo);
};
status.help = helpHelper({
	commandString: "~status",
	summary: "Fetches server status.",
});
