import { wrapperSettings } from "..";
import WrapperModule from "../lib/WrapperModule";
import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const loadModules: Command = async () => {
	await WrapperModule.loadModules(wrapperSettings.modules);
	return strOut([["Loaded modules ", "cyan"]], "cyan");
};
loadModules.help = helpHelper({
	commandString: "~listModules",
	summary: "Loads modules from wrapperSettings.",
});
