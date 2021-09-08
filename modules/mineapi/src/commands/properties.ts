// // export const showProperties: async message => {
// // 	let properties = await fn.getProperties();
// // 	return {
// // 		console: `${sS.c[sS.modules['properties'].color].c}Properties:}${Object.keys(properties).map(propertyKey => {
// // 			return `\nwhite"yellow${propertyKey}white"{red: ${sS.c['cyanBright'].c}${properties[propertyKey]}}`
// // 		}).join()}`,
// // 		minecraft: `tellraw ${message.logTo.user} ${
// // 			JSON.stringify([{
// // 				"text": `Properties: `,
// // 				"color": sS.c[sS.modules['properties'].color].m
// // 			}].concat(Object.keys(properties).map(propertyKey => {
// // 				return [{
// // 					"text": `\n"`,
// // 					"color": "white"
// // 				}, {
// // 					"text": `${propertyKey}`,
// // 					"color": "gold"
// // 				}, {
// // 					"text": `"`,
// // 					"color": "white"
// // 				}, {
// // 					"text": ":",
// // 					"color": "red"
// // 				}, {
// // 					"text": " ",
// // 					"color": "white"
// // 				}, {
// // 					"text": `${properties[propertyKey]}`,
// // 					"color": "aqua"
// // 				}]
// // 			}))
// // 		)}\n`,
// // 		discord : {
// // 			string: null,
// // 			embed: {
// // 				color: parseInt(sS.c[sS.modules['properties'].discordColor||sS.modules['properties'].color].h, 16),
// // 				title: `Properties`,
// // 				description: '```json\n'+`${JSON.stringify(properties, null, 2)}\n`+'```',
// // 				timestamp: new Date()
// // 			}
// // 		}
// // 	}
// // }

// // export const commands: Array<CommandConfig> = [{
// }, {
// 	// 	name: 'getProperties',
// 	// 	exeFunc: 'showProperties',
// 	// 	module: thisModule,
// 	// 	description: {
// 	// 		console: `whiteGets server.properties file contents. }Example: yellow~getProperties}`,
// 	// 		minecraft: [{
// 	// 			"text": `Gets server.properties file contents. `,
// 	// 			"color": "white"
// 	// 		}, {
// 	// 			"text": `Example: `,
// 	// 			"color": "gray"
// 	// 			}, {
// 	// 			"text": `~getProperties`,
// 	// 			"color": "gold"
// 	// 		}],
// 	// 		discord: {
// 	// 			embed: {
// 	// 				title: "Get Server Properties",
// 	// 				description: "~getProperties",
// 	// 				color: parseInt("e77c02", 16), // Orange
// 	// 				timestamp: new Date(),
// 	// 				fields: [{
// 	// 					name: "Description",
// 	// 					value: "Gets server.properties file contents."
// 	// 				}, {
// 	// 					name: "Example",
// 	// 					value: "**~getProperties**"
// 	// 				}]
// 	// 			}
// 	// 		}
// 	// 	}
// 	// }, {

// 	// }];
