import { LogTo } from "@spookelton/wrapperHelpers/types";
import { logg } from "./logg";

export const lErr = async (err: Error, logTo?: LogTo, message?: string) =>
	await logg(
		{
			console: `${message}\n${err.message}\n${err.stack}`,
			minecraft: [
				{
					text: `${message}\n`,
					color: "red",
				},
				{
					text: `${err.message}\n${err.stack}`,
					color: "white",
				},
			],
			discord: {
				color: parseInt("800000", 16),
				title: `${message} • ${err.message}`,
				description: err.stack,
				timestamp: new Date(),
			},
		},
		logTo
	).catch((err) =>
		console.log(`\u001b[91;1mError logging Error! Look... Shits real fucked if you're this deep in errors\u001b[0m ${err.message}\n${err.stack}`)
	);
