// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import { getProperties } from "../";
import { helpHelper, flatOutput } from "@spookelton/wrapperHelpers/modul";

export const properties: Command = async (message) => {
	const properties = await getProperties();
	return flatOutput(properties);
};
properties.help = helpHelper({
	commandString: "~properties",
	summary: "Fetches properties from server.properties.",
});
