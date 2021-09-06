import * as commands from "./commands";
export * from "./commands";

import { buildModuleInfo } from "@spookelton/wrapperHelpers/modul";
// Export moduleInfo
export const moduleInfo = buildModuleInfo({
	commands,
	persistent: false,
	color: "magentaBright",
	description: "Handles advaced math problems.",
});
