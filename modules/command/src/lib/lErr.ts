import { LogTo } from "@spookelton/wrapperHelpers/types";
import { logg } from "./logg";

export const lErr = async (err: Error, logTo?: LogTo, message?: string) => {
	message = message ? message + "\n" : "";
	if ((err.stack || "").includes(err.message)) err.message = "";
	else err.message = err.message ? err.message : "An unknown error occoured\n";
	err.stack = err.stack ? err.stack + "\n" : "";
	await logg(
		{
			console: `${message}${err.message}${err.stack}`,
			minecraft: [
				{
					text: message,
					color: "red",
				},
				{
					text: `${err.message}`,
					color: "white",
				},
				{
					text: `${err.stack}`,
					color: "white",
				},
			],
			discord: {
				embeds: [
					{
						color: parseInt("800000", 16),
						title: message ? `${message}\n${err.message}` : err.message,
						description: err.stack,
						timestamp: Date.now(),
					},
				],
			},
		},
		logTo
	).catch((err) =>
		console.log(`\u001b[91;1mError logging Error! Look... Shits real fucked if you're this deep in errors\u001b[0m ${err.message}\n${err.stack}`)
	);
};
