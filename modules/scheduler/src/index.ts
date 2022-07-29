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

type BaseEvent = {
	enabled: boolean;
	tasks: Task[];
};

type ConsoleTask = {
	type: "console";
	string: string;
};
type Task = ConsoleTask;
interface IntervalEvent extends BaseEvent {
	trigger: "timeElapsed";
	seconds: number;
	repeat?: boolean;
	preemptSchedules?: PreemptScheduledEvent[];
}
interface StartedEvent extends BaseEvent {
	trigger: "serverStarted";
}

type ScheduledEvent = IntervalEvent | StartedEvent;
interface PreemptScheduledEvent extends BaseEvent {
	secondsBefore: number;
	repeatInterval?: number;
}

type ModuleSettings = {
	schedules: ScheduledEvent[];
};

export const moduleSettings = db<ModuleSettings>("./_db/schedules.json", {
	forceCreate: true,
	updateOnExternalChanges: true,
	pretty: true,
	template: {
		schedules: [
			{
				enabled: false,
				tasks: [
					{
						type: "console",
						string: "stop\n",
					},
				],
				trigger: "timeElapsed",
				seconds: 240 * 60,
				preemptSchedules: [
					{
						enabled: true,
						tasks: [
							{
								type: "console",
								string: 'title @a title {"text":"Server restarting in {timeToEventInM} minutes"}\n',
							},
						],
						secondsBefore: 300,
						repeatInterval: 60,
					},
					{
						enabled: true,
						tasks: [
							{
								type: "console",
								string: 'title @a title {"text":"Server restarting in {timeToEventInS} seconds"}\n',
							},
						],
						secondsBefore: 15,
						repeatInterval: 1,
					},
				],
			},
		],
	},
});

const thread = (module.parent as ThreadModule).thread;

const stringFormatter = (s: string, opts?: { timeToEventInMs?: number }) => {
	if (opts?.timeToEventInMs !== undefined) {
		const inS = ~~(opts.timeToEventInMs / 1000);
		const inM = ~~(opts.timeToEventInMs / 1000 / 60);
		s = s
			.replaceAll("{timeToEventInMs}", opts.timeToEventInMs.toString())
			.replaceAll("{timeToEventInS}", inS.toString())
			.replaceAll("{timeToEventInM}", inM.toString());
	}
	return s;
};

thread.require<CoreExports>("@spookelton/serverWrapper").then(async (wrapperThread) => {
	const executor = async (tasks: Task[], context?: { timeToEventInMs: number }) => {
		for (const task of tasks) {
			switch (task.type) {
				case "console": {
					await wrapperThread.serverStdin(stringFormatter(task.string, context));
					break;
				}
			}
		}
	};
	const preempter = (preemptSchedule: PreemptScheduledEvent, opts: { start: number; offset: number; interval?: NodeJS.Timer }) => {
		const { start, offset } = opts;
		if (Date.now() < start + offset) {
			executor(preemptSchedule.tasks, { timeToEventInMs: (Date.now() - (start + offset)) * -1 });
			if (preemptSchedule.repeatInterval !== undefined && opts.interval === undefined) {
				opts.interval = setInterval(() => preempter(preemptSchedule, opts), preemptSchedule.repeatInterval * 1000);
			}
		} else {
			if (opts.interval !== undefined) {
				clearInterval(opts.interval);
				opts.interval = undefined;
			}
			opts.start = start + offset + offset;
			setTimeout(() => preempter(preemptSchedule, opts), opts.start - Date.now() - preemptSchedule.secondsBefore * 1000);
		}
	};

	for (const schedule of moduleSettings.schedules.filter((s) => s.enabled)) {
		switch (schedule.trigger) {
			case "timeElapsed": {
				const ms = schedule.seconds * 1000;
				if (schedule.repeat === true) setInterval(() => executor(schedule.tasks), ms);
				else setTimeout(() => executor(schedule.tasks), ms);
				if (schedule.preemptSchedules !== undefined) {
					for (const preemptSchedule of schedule.preemptSchedules.filter((s) => s.enabled)) {
						const opts = { start: Date.now(), offset: ms };
						setTimeout(() => preempter(preemptSchedule, opts), (schedule.seconds - preemptSchedule.secondsBefore) * 1000);
					}
				}
				break;
			}
			case "serverStarted": {
				wrapperThread.once("serverStarted", () => executor(schedule.tasks));
				break;
			}
		}
	}
});
