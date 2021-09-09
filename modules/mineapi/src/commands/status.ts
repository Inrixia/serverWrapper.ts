// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import { getStatus } from "../";
import { helpHelper, flatOutput } from "@spookelton/wrapperHelpers/modul";

export const status: Command = async (message) => {
	const pingInfo = await getStatus();
	// @ts-expect-error Delete this regardless
	delete pingInfo.rawResponse;
	return flatOutput(pingInfo);
};
status.help = helpHelper({
	commandString: "~status",
	summary: "Fetches server status.",
});
