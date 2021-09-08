// Import core packages
import props from "properties";
import mcServerUtils from "minecraft-server-util";
import chalk from "chalk";
import { promisify } from "util";
const properties = promisify(props.parse);

// Threading
import { ThreadModule } from "@inrixia/threads";
const thread = (module.parent as ThreadModule).thread;

// Import types
import type { CoreExports, Output } from "@spookelton/wrapperHelpers/types";

import { buildModuleInfo } from "@spookelton/wrapperHelpers/modul";
// Export moduleInfo
export const moduleInfo = buildModuleInfo({
	color: "cyan",
	description: "All things minecraft.",
});

type JSON = { [key: string]: unknown };

export const getProperties = async (): Promise<JSON | undefined> => {
	const wrapperCore = await thread.require<CoreExports>("@spookelton/serverWrapper");
	const { commandWorkingDirectory } = await wrapperCore.settings();
	return properties(`${commandWorkingDirectory + "/" || "./"}server.properties`, { path: true });
};
export const getStatus = async () => {
	const port = (await getProperties())?.["server-port"] as number;
	return mcServerUtils.status("localhost", { port });
};

// export const showProperty = async (message: Message) => {
// 	const property = (await getProperties())[message.args[1]];
// 	return {
// 		console: `${sS.c[sS.modules['properties'].color].c}Property }"${sS.c['yellowBright'].c}${message.args[1]}}"{red:} ${sS.c['cyanBright'].c}${property}}`,
// 		minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
// 			[{
// 				"text": `Property `,
// 				"color": sS.c[sS.modules['properties'].color].m
// 			}, {
// 				"text": `"`,
// 				"color": "white"
// 			}, {
// 				"text": `${message.args[1]}`,
// 				"color": "gold"
// 			}, {
// 				"text": `"`,
// 				"color": "white"
// 			}, {
// 				"text": ":",
// 				"color": "red"
// 			}, {
// 				"text": " ",
// 				"color": "white"
// 			}, {
// 				"text": `${property}`,
// 				"color": "aqua"
// 			}]
// 		)}\n`,
// 		discord : {
// 			string: null,
// 			embed: {
// 				color: parseInt(sS.c[sS.modules['properties'].discordColor||sS.modules['properties'].color].h, 16),
// 				title: `Property`,
// 				description: '```json\n'+`{\n  "${message.args[1]}": ${property}\n}\n`+'```',
// 				timestamp: new Date()
// 			}
// 		}
// 	}
// };

// export const showProperties: async message => {
// 	let properties = await fn.getProperties();
// 	return {
// 		console: `${sS.c[sS.modules['properties'].color].c}Properties:}${Object.keys(properties).map(propertyKey => {
// 			return `\nwhite"yellow${propertyKey}white"{red: ${sS.c['cyanBright'].c}${properties[propertyKey]}}`
// 		}).join()}`,
// 		minecraft: `tellraw ${message.logTo.user} ${
// 			JSON.stringify([{
// 				"text": `Properties: `,
// 				"color": sS.c[sS.modules['properties'].color].m
// 			}].concat(Object.keys(properties).map(propertyKey => {
// 				return [{
// 					"text": `\n"`,
// 					"color": "white"
// 				}, {
// 					"text": `${propertyKey}`,
// 					"color": "gold"
// 				}, {
// 					"text": `"`,
// 					"color": "white"
// 				}, {
// 					"text": ":",
// 					"color": "red"
// 				}, {
// 					"text": " ",
// 					"color": "white"
// 				}, {
// 					"text": `${properties[propertyKey]}`,
// 					"color": "aqua"
// 				}]
// 			}))
// 		)}\n`,
// 		discord : {
// 			string: null,
// 			embed: {
// 				color: parseInt(sS.c[sS.modules['properties'].discordColor||sS.modules['properties'].color].h, 16),
// 				title: `Properties`,
// 				description: '```json\n'+`${JSON.stringify(properties, null, 2)}\n`+'```',
// 				timestamp: new Date()
// 			}
// 		}
// 	}
// }

// export const commands: Array<CommandConfig> = [{
// 	name: 'getProperty',
// 	exeFunc: 'showProperty',
// 	module: thisModule,
// 	description: {
// 		console: chalk`{whiteGets given server property.} {whiteBright\nExample:} {yellow~getProperty server-port}{}}`,
// 		minecraft: [{
// 			"text": `Gets given server property.\n`,
// 			"color": "white"
// 		}, {
// 			"text": `Example: `,
// 			"color": "gray"
// 		}, {
// 			"text": `~getProperty server-port`,
// 			"color": "gold"
// 		}],
// 		discord: {
// 			embed: {
// 				title: "Get Server Property",
// 				description: "~getProperty",
// 				color: parseInt("e77c02", 16), // Orange
// 				timestamp: new Date(),
// 				fields: [{
// 					name: "Description",
// 					value: "Gets given server property from server.properties file."
// 				}, {
// 					name: "Example",
// 					value: "**~getProperty** server-port"
// 				}]
// 			}
// 		}
// 	}
// }, {
// 	name: 'getProperties',
// 	exeFunc: 'showProperties',
// 	module: thisModule,
// 	description: {
// 		console: `whiteGets server.properties file contents. }Example: yellow~getProperties}`,
// 		minecraft: [{
// 			"text": `Gets server.properties file contents. `,
// 			"color": "white"
// 		}, {
// 			"text": `Example: `,
// 			"color": "gray"
// 			}, {
// 			"text": `~getProperties`,
// 			"color": "gold"
// 		}],
// 		discord: {
// 			embed: {
// 				title: "Get Server Properties",
// 				description: "~getProperties",
// 				color: parseInt("e77c02", 16), // Orange
// 				timestamp: new Date(),
// 				fields: [{
// 					name: "Description",
// 					value: "Gets server.properties file contents."
// 				}, {
// 					name: "Example",
// 					value: "**~getProperties**"
// 				}]
// 			}
// 		}
// 	}
// }, {
// 	name: 'ping',
// 	exeFunc: 'showPing',
// 	module: thisModule,
// 	description: {
// 		console: `whitePings this server for info. }Example: yellow~ping}`,
// 		minecraft: [{
// 			"text": `Pings this server for info. `,
// 			"color": "white"
// 		}, {
// 			"text": `Example: `,
// 			"color": "gray"
// 			}, {
// 			"text": `~ping`,
// 			"color": "gold"
// 		}],
// 		discord: {
// 			string: null,
// 			embed: {
// 				title: "Pings this server",
// 				description: "~ping",
// 				color: parseInt("e77c02", 16), // Orange
// 				timestamp: new Date(),
// 				fields: [{
// 					name: "Description",
// 					value: "Pings this server for info."
// 				}, {
// 					name: "Example",
// 					value: "**~ping**"
// 				}]
// 			}
// 		}
// 	}
// }];
