import db from "@inrixia/db";

// Import Types
import type { ThreadModule } from "@inrixia/threads";
import type { CoreExports } from "@spookelton/wrapperHelpers/types";

import { buildModuleInfo } from "@spookelton/wrapperHelpers/modul";
// Export moduleInfo
export const moduleInfo = buildModuleInfo({
	color: "redBright",
	description: "Schedules things to happen",
});

type ScheduledEvent = {
	type: "console";
	string: string;
	trigger: "onInterval" | "serverStarted";
	repeatInterval?: number;
};
type ModuleSettings = {
	schedules: ScheduledEvent[];
};

export const moduleSettings = db<ModuleSettings>("./_db/schedules.json", {
	forceCreate: true,
	updateOnExternalChanges: true,
	pretty: true,
	template: {
		schedules: [],
	},
});

const thread = (module.parent as ThreadModule).thread;

thread.require<CoreExports>("@spookelton/serverWrapper").then(async (wrapperThread) => {
	const executor = (schedule: ScheduledEvent) => {
		switch (schedule.type) {
			case "console": {
				wrapperThread.serverStdin(schedule.string);
				break;
			}
		}
		if (schedule.repeatInterval !== undefined) setTimeout(() => executor(schedule), schedule.repeatInterval * 60 * 1000);
	};
	for (const schedule of moduleSettings.schedules) {
		switch (schedule.trigger) {
			case "onInterval": {
				if (schedule.repeatInterval === undefined) throw new Error("Scheduler cannot have a schedule with trigger onInterval and repeatInterval undefined");
				setTimeout(() => executor(schedule), schedule.repeatInterval * 60 * 1000);
				break;
			}
			case "serverStarted": {
				wrapperThread.on("serverStarted", () => executor(schedule));
				break;
			}
		}
	}
	wrapperThread.serverStdin;
});
