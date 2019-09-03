const thisModule = 'log'

// Import core packages
const modul = new [require('./modul.js')][0](thisModule);

// Set defaults
let sS = {} // serverSettings
let mS = {} // moduleSettings


// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'log':
			logOut(message.logObj);
			break;
		case 'execute':
			fn[message.func](message.data)
			.then(data => modul.resolve(data, message.promiseId, message.returnModule))
			.catch(err => modul.reject(err, message.promiseId, message.returnModule))
			break;
		case 'kill':
			modul.kill(message);
			break;
		case 'promiseResolve':
			modul.promiseResolve(message);
			break;
		case 'promiseReject':
			modul.promiseReject(message);
			break;
		case 'init':
			[sS, mS] = modul.loadSettings(message)
			break;
	}
});

async function logOut(logObj) {
	logObj.logTo = { 
		console: ((logObj||{}).logTo||{}).console||true,
		discord: ((logObj||{}).logTo||{}).discord||false,
		minecraft: ((logObj||{}).logTo||{}).minecraft||false
	}
	for (logInfo in logObj.logInfoArray) {
		logInfo = logObj.logInfoArray[logInfo]
		if (!logInfo || !logInfo.function) debug(`Invalid logInfo passed!! ${logInfo}`)
		else if (!logFunctions[logInfo.function]) debug(`Missing logging function for ${logInfo.function}!!`)
		else {
			logInfo.vars = logInfo.vars||{};
			logInfo.message.logTo.user = logObj.logTo.user;
			let logStrings = logFunctions[logInfo.function](logInfo.vars);
			logStrings.forEach(function(logString) {
				if (logObj.logTo.console && logString.console) process.stdout.write(logString.console+'\n');
				if (logObj.logTo.minecraft && logString.minecraft) process.send({ function: 'serverStdin', string: logString.minecraft });
				if (logObj.logTo.discord && logString.discord) process.send({
					function: 'unicast',
					module: 'discord',
					message: { function: 'discordStdin', string: logString.discord.string, embed: logString.discord.embed, channel: logObj.logTo.discord.channel||null }
				});
			})
		}
	}
}

/*
/ Discord embed object
/ https://anidiots.guide/first-bot/using-embeds-in-messages
/ https://discordapp.com/developers/docs/resources/channel#embed-object-embed-structure
*/

const logFunctions = {
	tpo: function(vars) {
		// message.logTo.username, vars.x, vars.y, vars.z, vars.executionStartTime, vars.executionEndTime
		return [{
			// Set inrix's position to 100 50 100
			console: `${sS.c['white'].c}Set ${sS.c['brightBlue'].c}${message.logTo.username}${sS.c['white'].c}'s postion to ${sS.c['orange'].c}${vars.x} ${sS.c['red'].c}${vars.y} ${sS.c['brightBlue'].c}${vars.z} ${sS.c['reset'].c}`,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
				[{
					"text": `Set `,
					"color": "white"
				}, {
					"text": `${message.logTo.username}`,
					"color": "brightBlue"
				}, {
					"text": `'s postion to `,
					"color": "white"
				}, {
					"text": `${vars.x} `,
					"color": "orange"
				}, {
					"text": `${vars.y} `,
					"color": "red"
				}, {
					"text": `${vars.z}`,
					"color": "brightBlue"
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['nbt'].discordColor||sS.modules['nbt'].color].h, 16),
					title: `Set ${message.logTo.username}'s postion to ${vars.x} ${vars.y} ${vars.z}`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	tpc: function(vars) {
		return [{
			minecraft: `tp ${message.logTo.user} ${vars.args[1]*16} 100 ${vars.args[2]*16}\n`
		}]
	},
	tpr: function(vars) {
		return [{
			minecraft: `tp ${message.logTo.user} ${vars.args[1]*512} 100 ${vars.args[2]*512}\n`
		}]
	},
	getSpawn: function(vars) {
		return [{
			console: `${sS.c[sS.modules['nbt'].color].c}World spawn is ${sS.c['reset'].c}${vars.worldSpawn.x} ${vars.worldSpawn.y} ${vars.worldSpawn.z}`,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
				[{
					"text": `World spawn is `,
					"color": sS.c[sS.modules['nbt'].color].m
				}, {
					"text": `${vars.worldSpawn.x} ${vars.worldSpawn.y} ${vars.worldSpawn.z}`,
					"color": "white"
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['nbt'].discordColor||sS.modules['nbt'].color].h, 16),
					title: `World spawn is ${vars.worldSpawn.x} ${vars.worldSpawn.y} ${vars.worldSpawn.z}`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	getProperty: function(vars) {
		return [{
			console: `${sS.c[sS.modules['properties'].color].c}Property ${sS.c['reset'].c}"${sS.c['brightYellow'].c}${vars.property}${sS.c['reset'].c}"${sS.c['red'].c}:${sS.c['reset'].c} ${sS.c['brightCyan'].c}${vars.propertyValue}${sS.c['reset'].c}`,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
				[{
					"text": `Property `,
					"color": sS.c[sS.modules['properties'].color].m
				}, {
					"text": `"`,
					"color": "white"
				}, {
					"text": `${vars.property}`,
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
					"text": `${vars.propertyValue}`,
					"color": "aqua"
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['properties'].discordColor||sS.modules['properties'].color].h, 16),
					title: `Property`,
					description: '```json\n'+`{\n  "${vars.property}": ${vars.propertyValue}\n}\n`+'```',
					timestamp: new Date(),
					footer: {
						text: `Executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	getProperties: function(vars) {
		let minecraftObj = [{
			"text": `Properties: `,
			"color": sS.c[sS.modules['properties'].color].m
		}];
		return [{
			console: `${sS.c[sS.modules['properties'].color].c}Properties:\n${sS.c['reset'].c}${vars.properties}`,
			minecraft: `tellraw ${message.logTo.user} ${
				JSON.stringify(minecraftObj.concat(Object.keys(vars.properties).map(function(propertyKey) {
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
						"text": `${vars.properties[propertyKey]}`,
						"color": "aqua"
					}]
				}))
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['properties'].discordColor||sS.modules['properties'].color].h, 16),
					title: `Properties`,
					description: '```json\n'+`${JSON.stringify(vars.properties, null, 2)}\n`+'```',
					timestamp: new Date(),
					footer: {
						text: `Executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	//getProperty error
	getProperty_undefined: function(vars) {
		return [{
			console: `${sS.c[sS.modules['properties'].color].c}Property ${sS.c['reset'].c}${vars.property} does not exist...`,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
				[{
					"text": `Property `,
					"color": sS.c[sS.modules['properties'].color].m
				}, {
					"text": `${vars.property} does not exist...`,
					"color": "white"
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['properties'].discordColor||sS.modules['properties'].color].h, 16),
					title: `Property ${vars.property} does not exist...`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	//Kill Module Error
	killModule_notRunning: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Module${sS.c['reset'].c} ${vars.color.c}${vars.name}${sS.c['reset'].c} is not running...`,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
				[{
					"text": `Module `,
					"color": sS.c['brightCyan'].m
				}, {
					"text": vars.name,
					"color": vars.color.m
				}, {
					"text": ` is not running...`,
					"color": "white"
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(vars.color.h, 16),
					title: `Module: ${vars.name} is not running...`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Executed in ${util.getDuration(message.exeStart, new Date())}`
					}
				}
			}
		}]
	},
	//command not found error
	commandNotFound: function(vars) {
		return [{
			console: `The command "${sS.c['brightRed'].c}${vars.message.string}${sS.c['reset'].c}" could not be matched to a known command...`,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
				[{
					"text": `The command "`,
					"color": "white"
				}, {
					"text": vars.message.string,
					"color": sS.c['brightRed'].m
				}, {
					"text": `" could not be matched to a known command...`,
					"color": "white"
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c['red'].h, 16),
					title: `The command "${vars.message.string}" could not be matched to a known command...`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	//startmodule error
	startModule_alreadyRunning: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Module${sS.c['reset'].c} ${vars.color.c}${vars.name}${sS.c['reset'].c} is already running...`,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
				[{
					"text": 'Module ',
					"color": sS.c['brightCyan'].m
				}, {
					"text": vars.name,
					"color": vars.color.m
				}, {
					"text": 'Is already running...',
					"color": "white"
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(vars.color.h, 16),
					title: `Module ${vars.name} is already running...`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Executed in ${util.getDuration(message.exeStart, new Date())}`
					}
				}
			}
		}]
	},
	cw_removeall: function(vars) {
		return [{
			discord: { string: `Removed all commands from **${(vars.whitelisted_object.Username) ? vars.whitelisted_object.Username : vars.whitelisted_object.Name}**`, embed: null }
		}]
	},

	cw_remove: function(vars) {
		return [{
			discord: { string: `Removed command **${vars.args[1]}** from **${(vars.whitelisted_object.Username) ? vars.whitelisted_object.Username : vars.whitelisted_object.Name}**`, embed: null }
		}]
	},
	cw_add: function(vars) {
		console.log(vars)
		return [{
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['command'].discordColor||sS.modules['command'].color].h, 16),
					title: `Whitelisted command ${vars.args[1]} for @${(vars.cr.wo.Username) ? vars.cr.wo.Username : vars.cr.wo.Name}`,
					description: `Expires in ${moment(vars.cr.expiresin).fromNow(true)}`,
					timestamp: new Date(),
					footer: {
						text: `Executed in ${util.getDuration(message.exeStart, new Date())}`
					}
				}
			},
			console: `Whitelisted command ${sS.c['cyan'].c}${vars.args[1]}${sS.c['reset'].c} for ${sS.c['brightBlue'].c}${(vars.cr.wo.Username) ? vars.cr.wo.Username : vars.cr.wo.Name}${sS.c['reset'].c} ${sS.c['yellow'].c}${(vars.args[3]) ? `Expires in ${moment(vars.cr.expiresin).fromNow(true)}` : ''}${sS.c['reset'].c}`
		}]
	}
};
