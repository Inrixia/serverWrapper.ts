import WrapperModule from "../lib/WrapperModule";
import { helpHelper, strOut } from "@spookelton/wrapperHelpers/modul";

// Import Types
import type { Command } from "@spookelton/wrapperHelpers/types";

export const killModule: Command = async (message) => {
	const moduleName = message.args[0];
	if (moduleName === undefined) throw new Error("No module specified.");
	const moduleToKill = WrapperModule.loadedModules[moduleName];
	if (moduleToKill === undefined) throw new Error(`Module ${moduleName} is not loaded. Loaded modules: ${Object.keys(WrapperModule.loadModules).join(" ")}`);
	await moduleToKill.kill();
	return strOut(
		[
			["Killed module ", "cyan"],
			[moduleName, moduleToKill.color],
		],
		moduleToKill.color
	);
};
killModule.help = helpHelper({
	commandString: "~killModule",
	summary: "Kills any given module.",
	exampleArgs: [["discord"], ["auth"]],
});
