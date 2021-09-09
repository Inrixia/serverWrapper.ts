// Import Types
import { Command } from "@spookelton/wrapperHelpers/types";

import { getProperties } from "../";
import { helpHelper, flatOut } from "@spookelton/wrapperHelpers/modul";

export const property: Command = async (message) => {
	const propertyName = message.args[0];
	if (propertyName === undefined) throw new Error("No property specified");
	const properties = await getProperties();
	return flatOut(properties?.[propertyName]);
};
property.help = helpHelper({
	commandString: "~property",
	summary: "Returns given server property.",
	exampleArgs: [["server-port"]],
});
