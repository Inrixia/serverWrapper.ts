// export const thisModule = "math";

// // Import core packages
// import math from "mathjs";
// import chalk from "chalk";

// import type { Command, CommandConfig, SetModuleSettings, Message, WrapperThreadModule } from "@spookelton/wrapperHelpers";

// let moduleSettings = (require.main as WrapperThreadModule).thread.data;

// export const setModuleSettings: SetModuleSettings = (newSettings) => {
// 	moduleSettings = newSettings;
// };

// export const qm: Command = async (message: Message) => {
// 	const question = message.args.slice(1, message.args.length).join(" ");
// 	const answer = math.evaluate(question).toString();
// 	return {
// 		console: chalk`{white${question}'s} {yellow=>} {cyanBright ${answer}}`,
// 		minecraft: `tellraw ${message.logTo.user} ${JSON.stringify([
// 			{
// 				text: question,
// 				color: "white",
// 			},
// 			{
// 				text: " => ",
// 				color: "gold",
// 			},
// 			{
// 				text: answer,
// 				color: "aqua",
// 			},
// 		])}\n`,
// 		discord: {
// 			string: null,
// 			embed: {
// 				color: moduleSettings.color.discord,
// 				title: `${question} => ${answer}`,
// 				description: undefined,
// 				timestamp: new Date(),
// 			},
// 		},
// 	};
// };

// export const commands: Array<CommandConfig> = [
// 	{
// 		name: "qm",
// 		exeFunc: "qm",
// 		module: thisModule,
// 		description: {
// 			console: chalk`Accepts any math question and/or unit conversion. {white \nExamples:\n}{yellow ~qm} {cyan 1 + 1\n}{yellow ~qm} {cyan 1.2inch to cm\n}{yellow ~qm} {cyan 1.2 * (2 + 4.5)\n}{yellow~qm} {cyan sin(45 deg) ^ 2\n}{yellow ~qm} {cyan 9 / 3 + 2i\n{yellow ~qm} {cyan det([-1, 2; 3, 1])}`,
// 			minecraft: [
// 				{
// 					text: "Accepts any math question and/or unit conversion.\n",
// 					color: "gray",
// 				},
// 				{
// 					text: "Examples:\n",
// 					color: "white",
// 				},
// 				{
// 					text: "~qm ",
// 					color: "gold",
// 				},
// 				{
// 					text: "1+1\n",
// 					color: "dark_aqua",
// 				},
// 				{
// 					text: "~qm ",
// 					color: "gold",
// 				},
// 				{
// 					text: "1cm to inch\n",
// 					color: "dark_aqua",
// 				},
// 				{
// 					text: "~qm ",
// 					color: "gold",
// 				},
// 				{
// 					text: "1.2 * (2 + 4.5)\n",
// 					color: "dark_aqua",
// 				},
// 				{
// 					text: "~qm ",
// 					color: "gold",
// 				},
// 				{
// 					text: "sin(45 deg) ^ 2\n",
// 					color: "dark_aqua",
// 				},
// 				{
// 					text: "~qm ",
// 					color: "gold",
// 				},
// 				{
// 					text: "9 / 3 + 2i\n",
// 					color: "dark_aqua",
// 				},
// 				{
// 					text: "~qm ",
// 					color: "gold",
// 				},
// 				{
// 					text: "det([-1, 2; 3, 1])\n",
// 					color: "dark_aqua",
// 				},
// 			],
// 			discord: {
// 				embed: {
// 					title: "Quick Math",
// 					description: "~qm",
// 					color: parseInt("e77c02", 16),
// 					timestamp: new Date(),
// 					fields: [
// 						{
// 							name: "Description",
// 							value: "Accepts any math question and/or unit conversion. For more info see https://mathjs.org/",
// 						},
// 						{
// 							name: "Examples:",
// 							value: "**~qm** 1 + 1\n**~qm** 1.2inch to cm\n**~qm** 1.2 * (2 + 4.5)\n**~qm** sin(45 deg) ^ 2\n**~qm** 9 / 3 + 2i\n**~qm** det([-1, 2; 3, 1])",
// 						},
// 					],
// 				},
// 			},
// 		},
// 	},
// ];
