// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import { helpHelper } from "@spookelton/wrapperHelpers/modul";

// Import helper functions for tps handling.
import { runTpsCommand, tpsToColor } from "../lib/tps"


export const tps: Command = async (message) => {
	// Run the tps command, and wait for a response from server console.
	const result = await runTpsCommand();

	// Construct the message containing overall tps
	return {
		discord: {
			embeds: [{
				title: "Overall Server TPS:",
				description: `**TPS**: \`${result.overall.tps}\`\n**Tick Time**: \`${result.overall.tickTime}\` ms`,
				color: parseInt(tpsToColor(result.overall.tps), 16),
				timestamp: new Date().toISOString(),
			}]
		}
	};
};
tps.help = helpHelper({
	commandString: "~tps",
	summary: "Returns the overall TPS of the server.",
});