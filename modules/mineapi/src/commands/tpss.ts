// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import { helpHelper } from "@spookelton/wrapperHelpers/modul";

// Import helper functions for tps handling.
import { runTpsCommand, tpsToColor, formatDimension } from "../lib/tps"


export const tpss: Command = async (message) => {
    // Run the tps command, and wait for a response from server console.
	const result = await runTpsCommand();

	// Construct the message containing tps info
	return {
        discord: {
            embeds: [{
                title: "Server TPS:",
                description:
                    result.dimensions.map(formatDimension).join("\n") +
                    `\n\n**Overall**:\n TPS: \`${result.overall.tps}\` • Tick Time: \`${result.overall.tickTime}\` ms`,
                color: tpsToColor(result.overall.tps),
                timestamp: Date.now(),
            }]
        }
    };
};
tpss.help = helpHelper({
	commandString: "~tpss",
	summary: "Returns detailed information on the TPS of the server.",
});