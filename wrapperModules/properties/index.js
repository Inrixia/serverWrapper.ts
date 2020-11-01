const thisModule = 'properties';

// Import core packages
const properties = require('properties');
const mcping = require('mc-ping-updated');

function pProp() {
	return new Promise((resolve, reject) => {
		properties.parse('./server.properties', {path: true}, (err, properties) => {
			if (err) reject(err)
			else resolve(properties)
		});
	})
}

// Import core packages
const modul = new [require('./modul.js')][0](thisModule)
let fn = {
	init: async message => {
		[sS, mS] = modul.loadSettings(message)
		modul.event.on('fetchCommands', () => {
			modul.emit('exportCommands', [{
				name: 'getProperty',
				exeFunc: 'showProperty',
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Gets given server property. ${sS.c['brightWhite'].c}\nExample: ${sS.c['yellow'].c}~getProperty server-port${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Gets given server property.\n`,
						"color": sS.c['brightWhite'].m
					}, {
						"text": `Example: `,
						"color": sS.c['white'].m
					}, {
						"text": `~getProperty server-port`,
						"color": sS.c['yellow'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Get Server Property",
							description: "~getProperty",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Gets given server property from server.properties file."
							}, {
								name: "Example",
								value: "**~getProperty** server-port"
							}]
						}
					}
				}
			}, {
				name: 'getProperties',
				exeFunc: 'showProperties',
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Gets server.properties file contents. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~getProperties${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Gets server.properties file contents. `,
						"color": sS.c['brightWhite'].m
					}, {
						"text": `Example: `,
						"color": sS.c['white'].m
						}, {
						"text": `~getProperties`,
						"color": sS.c['yellow'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Get Server Properties",
							description: "~getProperties",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Gets server.properties file contents."
							}, {
								name: "Example",
								value: "**~getProperties**"
							}]
						}
					}
				}
			}, {
				name: 'ping',
				exeFunc: 'showPing',
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Pings this server for info. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~ping${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Pings this server for info. `,
						"color": sS.c['brightWhite'].m
					}, {
						"text": `Example: `,
						"color": sS.c['white'].m
						}, {
						"text": `~ping`,
						"color": sS.c['yellow'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Pings this server",
							description: "~ping",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Pings this server for info."
							}, {
								name: "Example",
								value: "**~ping**"
							}]
						}
					}
				}
			}])
		})
	},
	ping: async data => {
		let serverPort = await fn.getProperty('server-port')
		return await new Promise((resolve, reject) => mcping('localhost', serverPort, (err, res) => {
			if (err) reject(new Error(err));
			else resolve(res);
		}, 1000))
	},
	getProperty: async propertyKey => {
		return (await pProp())[propertyKey];
	},
	getProperties: async () => {
		return await pProp();
	},
	showPing: async message => {
		let ping = (await fn.ping());
		return {
			console: `${sS.c['yellow'].c}MOTD${sS.c['reset'].c}: ${ping.description.text}\n${sS.c['yellow'].c}Online${sS.c['reset'].c}: ${ping.players.online}${sS.c['red'].c}/${sS.c['reset'].c}${ping.players.max}\n${sS.c['yellow'].c}Version${sS.c['reset'].c}: ${ping.version.name}\n${sS.c['yellow'].c}Protocol${sS.c['reset'].c}: ${ping.version.protocol}${sS.c['reset'].c}`,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
				[{
					"text": `MOTD`,
					"color": "gold"
				}, {
					"text": `: `,
					"color": "brightRed"
				}, {
					"text": `${ping.description.text}`,
					"color": "white"
				}, {
					"text": `\n`
				}, {
					"text": `Online`,
					"color": "gold"
				}, {
					"text": `: `,
					"color": "brightRed",
					"color": "white"
				}, {
					"text": `${ping.players.online}`,
					"color": "white"
				}, {
					"text": `/`,
					"color": "red"
				}, {
					"text": `${ping.players.max}`,
					"color": "white"
				}, {
					"text": `\n`
				}, {
					"text": `Version`,
					"color": "gold"
				}, {
					"text": `: `,
					"color": "brightRed"
				}, {
					"text": `${ping.version.name}`,
					"color": "white"
				}, {
					"text": `\n`
				}, {
					"text": `Protocol`,
					"color": "gold"
				}, {
					"text": `: `,
					"color": "brightRed"
				}, {
					"text": `${ping.version.protocol}`,
					"color": "white"
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['properties'].discordColor||sS.modules['properties'].color].h, 16),
					title: `Ping Info`,
					description: '```json\n'+JSON.stringify(ping, null, 2)+'```',
					timestamp: new Date()
				}
			}
		}
	},
	showProperty: async message => {
		let property = (await fn.getProperties())[message.args[1]];
		return {
			console: `${sS.c[sS.modules['properties'].color].c}Property ${sS.c['reset'].c}"${sS.c['brightYellow'].c}${message.args[1]}${sS.c['reset'].c}"${sS.c['red'].c}:${sS.c['reset'].c} ${sS.c['brightCyan'].c}${property}${sS.c['reset'].c}`,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
				[{
					"text": `Property `,
					"color": sS.c[sS.modules['properties'].color].m
				}, {
					"text": `"`,
					"color": "white"
				}, {
					"text": `${message.args[1]}`,
					"color": "gold"
				}, {
					"text": `"`,
					"color": "white"
				}, {
					"text": ":",
					"color": "red"
				}, {
					"text": " ",
					"color": "white"
				}, {
					"text": `${property}`,
					"color": "aqua"
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['properties'].discordColor||sS.modules['properties'].color].h, 16),
					title: `Property`,
					description: '```json\n'+`{\n  "${message.args[1]}": ${property}\n}\n`+'```',
					timestamp: new Date()
				}
			}
		}
	},
	showProperties: async message => {
		let properties = await fn.getProperties();
		return {
			console: `${sS.c[sS.modules['properties'].color].c}Properties:${sS.c['reset'].c}${Object.keys(properties).map(propertyKey => {
				return `\n${sS.c['white'].c}"${sS.c['yellow'].c}${propertyKey}${sS.c['white'].c}"${sS.c['red'].c}: ${sS.c['brightCyan'].c}${properties[propertyKey]}${sS.c['reset'].c}`
			}).join()}`,
			minecraft: `tellraw ${message.logTo.user} ${
				JSON.stringify([{
					"text": `Properties: `,
					"color": sS.c[sS.modules['properties'].color].m
				}].concat(Object.keys(properties).map(propertyKey => {
					return [{
						"text": `\n"`,
						"color": "white"
					}, {
						"text": `${propertyKey}`,
						"color": "gold"
					}, {
						"text": `"`,
						"color": "white"
					}, {
						"text": ":",
						"color": "red"
					}, {
						"text": " ",
						"color": "white"
					}, {
						"text": `${properties[propertyKey]}`,
						"color": "aqua"
					}]
				}))
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['properties'].discordColor||sS.modules['properties'].color].h, 16),
					title: `Properties`,
					description: '```json\n'+`${JSON.stringify(properties, null, 2)}\n`+'```',
					timestamp: new Date()
				}
			}
		}
	}
};

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'execute':
			if (!(message.func in fn)) modul.reject(new Error(`Command ${message.func} does not exist in module ${thisModule}`), message.promiseId, message.returnModule)
			else fn[message.func](message.data)
			.then(data => modul.resolve(data, message.promiseId, message.returnModule))
			.catch(err => modul.reject(err, message.promiseId, message.returnModule))
			break;
		case 'pushSettings':
			[sS, mS] = modul.loadSettings(message)
			break;
	}
});