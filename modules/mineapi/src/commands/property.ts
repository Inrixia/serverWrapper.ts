// import chalk from "chalk";

// // Import Types
// import { Command } from "@spookelton/wrapperHelpers/types";
// import { mc, hex } from "@spookelton/wrapperHelpers/colors";

// import { getProperties } from "../";

// export const property: Command = async (message) => {
// 	const propertyName = message.args[0];
// 	if (!propertyName) throw new Error("No property specified");
// 	const property = (await getProperties())?.[propertyName];
// 	return {
// 		console: chalk`{cyan ${propertyName}} {magentaBright =>} {red ${property}}`,
// 		minecraft: [
// 			{
// 				text: propertyName,
// 				color: mc.cyan,
// 			},
// 			{
// 				text: ": ",
// 			},
// 			{
// 				text: property,
// 				color: mc.red,
// 			},
// 		],
// 		discord: {
// 			color: parseInt(hex.cyan, 16),
// 			title: `Property`,
// 			description: "```json\n" + `{\n  "${propertyName}": ${property}\n}\n` + "```",
// 			timestamp: Date.now(),
// 		},
// 	};
// };
// property.help = {
// 	console: chalk`{whiteBright Returns given server property.}\nExample: {yellow ~getProperty} {blueBright server-port}`,
// 	minecraft: [
// 		{
// 			text: `Gets given server property.\n`,
// 			color: "white",
// 		},
// 		{
// 			text: `Example: `,
// 			color: "gray",
// 		},
// 		{
// 			text: `~getProperty server-port`,
// 			color: "gold",
// 		},
// 	],
// 	discord: {
// 		title: "Get Server Property",
// 		description: "~getProperty",
// 		color: parseInt("e77c02", 16), // Orange
// 		timestamp: new Date(),
// 		fields: [
// 			{
// 				name: "Description",
// 				value: "Gets given server property from server.properties file.",
// 			},
// 			{
// 				name: "Example",
// 				value: "**~getProperty** server-port",
// 			},
// 		],
// 	},
// };
