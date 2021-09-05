// export const thisModule = "math";

// // Import core packages
// import properties from 'properties';
// import mcServerUtils from 'minecraft-server-util';
// import chalk from "chalk";

// // Import Wrapper Types
// import { CommandConfig, Init, Message, Output, ThreadModule } from '@spookelton/wrapperHelpers';

// const moduleSettings = (require.main as ThreadModule).thread.data!;

// export const getProperties = (): Promise<{ [key: string]: unknown }> => new Promise((resolve, reject) => {
// 	properties.parse('./server.properties', {path: true}, (err, properties) => {
// 		if (err) reject(err)
// 		else resolve(properties!)
// 	});
// })

// // Import core packages
// export const init: Init = async () => {}

// export const getProperty = async (propertyKey: string): Promise<unknown> => (await getProperties())[propertyKey];
// export const ping = () => mcServerUtils.status('localhost', { port: await getProperty('server-port') as number })

// export const showPing = async (message: Message): Promise<Output> => {
// 	const pingInfo = await ping();
// 	return {
// 		console: `{yellow MOTD}: ${pingInfo.description?.descriptionText}}\n{yellow Online}{} : ${pingInfo.onlinePlayers}}{red /}{} ${pingInfo.maxPlayers}}\n{yellow Version}{} : ${pingInfo.version}}\n{yellow Protocol}{} : ${pingInfo.protocolVersion}}{}}`,
// 		minecraft: `tellraw ${message.logTo.user} ${JSON.stringify([
// 			{
// 				"text": `MOTD`,
// 				"color": "gold"
// 			}, {
// 				"text": `: `,
// 				"color": "redBright"
// 			}, {
// 				"text": pingInfo.description?.descriptionText,
// 				"color": "white"
// 			}, {
// 				"text": `\n`
// 			}, {
// 				"text": `Online`,
// 				"color": "gold"
// 			}, {
// 				"text": `: `,
// 				"color": "redBright",
// 				"color": "white"
// 			}, {
// 				"text": pingInfo.onlinePlayers,
// 				"color": "white"
// 			}, {
// 				"text": `/`,
// 				"color": "red"
// 			}, {
// 				"text": pingInfo.maxPlayers,
// 				"color": "white"
// 			}, {
// 				"text": `\n`
// 			}, {
// 				"text": `Version`,
// 				"color": "gold"
// 			}, {
// 				"text": `: `,
// 				"color": "redBright"
// 			}, {
// 				"text": pingInfo.version,
// 				"color": "white"
// 			}, {
// 				"text": `\n`
// 			}, {
// 				"text": `Protocol`,
// 				"color": "gold"
// 			}, {
// 				"text": `: `,
// 				"color": "redBright"
// 			}, {
// 				"text": pingInfo.protocolVersion,
// 				"color": "white"
// 			}
// 		])}\n`,
// 		discord : {
// 			embed: {
// 				hexColor: moduleSettings.color,
// 				title: `Ping Info`,
// 				description: '```json\n'+JSON.stringify(ping, null, 2)+'```',
// 				timestamp: new Date()
// 			}
// 		}
// 	}
// };

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
