// Import core packages
const moment = require("moment");

// Set defaults
var sS = {} // serverSettings
var mS = {} // moduleSettings

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			sS = message.sS;
			mS = sS.modules['log'].settings;
			break;
		case 'kill':
			process.exit();
			break;
		case 'log':
			logOut(message.logObj);
			break;
		case 'pushSettings':
			sS = message.sS;
			mS = sS.modules['log'].settings;
			break;
	}
});



function parseDuration(startTime, endTime) {
	let duration = moment.duration(endTime.diff(startTime));
	let t = {
		ms: duration.milliseconds(),
		s: duration.seconds(),
		m: duration.minutes(),
		h: duration.hours()
	}
	t.ms = t.ms||1; // Make sure we dont have no time passed
	return `${(t.m>0) ? `${t.m}min, ` : ''}${(t.s>0) ? `${t.s}sec, ` : ''}${(t.ms>0) ? `${t.ms}ms` : ''}`;
}

function logOut(logObj) {
	if (!logObj.logTo) logObj.logTo = { console: true, discord: false, minecraft: false }
	for (logInfo in logObj.logInfoArray) {
		logInfo = logObj.logInfoArray[logInfo]
		if (!logInfo || !logInfo.function) debug(`Invalid logInfo passed!! ${logInfo}`)
		else if (!logFunctions[logInfo.function]) debug(`Missing logging function for ${logInfo.function}!!`)
		else {
			logInfo.vars.user = logObj.logTo.user;
			var logStrings = logFunctions[logInfo.function](logInfo.vars);
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
/ Util Functions
*/

function debug(stringOut) {
	try {
		if (typeof stringOut === 'string') process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset'].c} ${stringOut}\n\n`)
		else {
			process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset'].c}`);
			console.log(stringOut);
		}
	} catch (e) {
		process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset'].c} ${stringOut}\n\n`);
	}
}

if (!('toJSON' in Error.prototype))
Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        var alt = {};

        Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key];
        }, this);

        return alt;
    },
    configurable: true,
    writable: true
});

/*
/ Discord embed object
/ https://anidiots.guide/first-bot/using-embeds-in-messages
/ https://discordapp.com/developers/docs/resources/channel#embed-object-embed-structure
*/

const logFunctions = {
	help: function(vars) {
		return [{
			console: vars.console,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(vars.minecraft)}\n`,
			discord: vars.discord
		}]
	},
	error: function(vars) {
		return [{
			console: `${vars.niceName ? `${sS.c['brightRed'].c}${vars.niceName}${sS.c['reset'].c} ` : ''}${vars.err.message}\n${vars.err.stack}`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
				[{
					"text": `${vars.niceName||''}\n`,
					"color": sS.c['brightRed'].m
				}, {
					"text": `${vars.err.message}\n${vars.err.stack}`,
					"color": "white"
				}]
			)}\n`,
			discord: {
				string: null,
				embed: {
					color: parseInt(sS.c['red'].h, 16),
					title: `${vars.niceName ? `${vars.niceName} ` : ''}${vars.err.message}`,
					description: vars.err.stack,
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
			minecraft: `tp ${vars.user} ${vars.args[1]*16} 100 ${vars.args[2]*16}\n`
		}]
	},
	tpr: function(vars) {
		return [{
			minecraft: `tp ${vars.user} ${vars.args[1]*512} 100 ${vars.args[2]*512}\n`
		}]
	},
	qm: function(vars) {
		return [{
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
				[{
					"text": vars.question,
					"color": "white"
				}, {
					"text": " => ",
					"color": "gold"
				}, {
					"text": vars.answer,
					"color": "aqua"
				}]
			)}\n`
		}]
	},
	getSpawn: function(vars) {
		return [{
			console: `${sS.c[sS.modules['nbt'].color].c}World spawn is ${sS.c['reset'].c}${vars.worldSpawn.x} ${vars.worldSpawn.y} ${vars.worldSpawn.z}`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
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
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
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
			minecraft: `tellraw ${vars.user} ${
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
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
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
	clearBackupInterval: function(vars) {
		return [{
			console: `${sS.c[sS.modules['backup'].color].c}Automatic backup's stopped!${sS.c['reset'].c}`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
				{
					"text": `Automatic backup's stopped!`,
					"color": sS.c[sS.modules['backup'].color].m
				}
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['backup'].discordColor||sS.modules['backup'].color].h, 16),
					title: `Automatic backup's stopped...`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	startBackupInterval: function(vars) {
		return [{
			console: `${sS.c[sS.modules['backup'].color].c}Automatic backup's started!${sS.c['reset'].c} Next backup in ${moment(vars.timeToNextBackup).fromNow()}`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
				[{
					"text": `Automatic backup's started!`,
					"color": sS.c[sS.modules['backup'].color].m
				}, {
					"text": `Next backup in ${moment(vars.timeToNextBackup).fromNow()}`,
					"color": "white"
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['backup'].discordColor||sS.modules['backup'].color].h, 16),
					title: `Automatic backup's started...`,
					description: `Next backup in ${moment(vars.timeToNextBackup).fromNow()}`,
					timestamp: new Date(),
					footer: {
						text: `Executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	loadSettings: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Loaded settings${sS.c['reset'].c}`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
				{
					"text": `Loaded settings`,
					"color": sS.c['brightCyan'].m
				}
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c['brightCyan'].h, 16),
					title: `Loaded settings...`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	saveSettings: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Saved settings${sS.c['reset'].c}`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
				{
					"text": `Saved settings`,
					"color": sS.c['brightCyan'].m
				}
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c['brightCyan'].h, 16),
					title: `Saved settings...`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	backupSettings: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Backed up settings${sS.c['reset'].c}`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
				{
					"text": `Backed up settings`,
					"color": sS.c['brightCyan'].m
				}
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c['brightCyan'].h, 16),
					title: `Backed up settings...`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	loadModuleFunctions: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Loaded${sS.c['reset'].c} ${vars.color.c}${vars.name}${sS.c['reset'].c}'s functions`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
				[{
					"text": `Loaded `,
					"color": sS.c['brightCyan'].m
				}, {
					"text": `${vars.name}'s'`,
					"color": vars.color.m
				}, {
					"text": ` functions`,
					"color": "white"
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(vars.color.h, 16),
					title: `Loaded ${vars.name}'s functions'`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Command executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	killModule: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Killed module${sS.c['reset'].c}: ${vars.color.c}${vars.name}${sS.c['reset'].c}`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
				[{
					"text": `Killed module `,
					"color": sS.c['brightCyan'].m
				}, {
					"text": vars.name,
					"color": vars.color.m
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(vars.color.h, 16),
					title: `Killed module: ${vars.name}`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Command executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	//Kill Module Error
	killModule_notRunning: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Module${sS.c['reset'].c} ${vars.color.c}${vars.name}${sS.c['reset'].c} is not running...`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
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
						text: `Command executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	//command not found error
	commandNotFound: function(vars) {
		return [{
			console: `The command "${sS.c['brightRed'].c}${vars.message.string}${sS.c['reset'].c}" could not be matched to a known command...`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
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
	startModule: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Started module${sS.c['reset'].c}: ${vars.color.c}${vars.name}${sS.c['reset'].c}`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
				[{
					"text": `Started module `,
					"color": sS.c['brightCyan'].m
				}, {
					"text": vars.name,
					"color": vars.color.m
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(vars.color.h, 16),
					title: `Started module: ${vars.name}`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Command executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	//startmodule error
	startModule_alreadyRunning: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Module${sS.c['reset'].c} ${vars.color.c}${vars.name}${sS.c['reset'].c} is already running...`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
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
						text: `Command executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	enableModule: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Enabled module${sS.c['reset'].c}: ${vars.color.c}${vars.name}${sS.c['reset'].c}`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
				[{
					"text": `Enabled module `,
					"color": sS.c['brightCyan'].m
				}, {
					"text": vars.name,
					"color": vars.color.m
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(vars.color.h, 16),
					title: `Enabled module: ${vars.name}`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Command executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	disableModule: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Disabled module${sS.c['reset'].c}: ${vars.color.c}${vars.name}${sS.c['reset'].c}`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
				[{
					"text": `Disabled module `,
					"color": sS.c['brightCyan'].m
				}, {
					"text": vars.name,
					"color": vars.color.m
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(vars.color.h, 16),
					title: `Disabled module: ${vars.name}`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Command executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
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
		return [{
			discord: { string: `Added command **${vars.args[1]}** to **${(vars.whitelisted_object.Username) ? vars.whitelisted_object.Username : vars.whitelisted_object.Name}** ${(vars.args[3]) ? `Expires ${vars.expiresin}` : ''}`, embed: null }
		}]
	},
	nextBackup: function(vars) {
		return [{
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['backup'].discordColor||sS.modules['backup'].color].h, 16),
					title: `${vars.timeToNextBackup ? `Next backup in ${moment(vars.timeToNextBackup).fromNow()}` : 'Backups disabled...'}`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Command executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			},
			console: `${ vars.timeToNextBackup ? `${sS.c[sS.modules['backup'].color].c}Next backup ${moment(vars.timeToNextBackup).fromNow()}` : `${sS.c[sS.modules['backup'].color].c}Backups disabled...`}${sS.c['reset'].c}`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
				[{
					"text": vars.timeToNextBackup ? `Next backup ` : 'Backups disabled...',
					"color": vars.timeToNextBackup ? '' : sS.c[sS.modules['backup'].color].m
				}, {
					"text": vars.timeToNextBackup ? moment(vars.timeToNextBackup).fromNow() : '',
					"color": vars.timeToNextBackup ? sS.c[sS.modules['backup'].color].m : ''
				}]
			)}\n`
		}]
	},
	backupDir: function(vars) {
		return [{
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['backup'].discordColor||sS.modules['backup'].color].h, 16),
					title: `Saving backups in: ${vars.backupDir}`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Command executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			},
			console: `Saving backups in: ${sS.c[sS.modules['backup'].color].c}${vars.backupDir}${sS.c['reset'].c}`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
				[{
					"text": `Saving backups in: `,
					"color": "white"
				}, {
					"text": vars.backupDir,
					"color": sS.c[sS.modules['backup'].color].m
				}]
			)}\n`
		}]
	},
	lastBackup: function(vars) {
		return [{
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['backup'].discordColor||sS.modules['backup'].color].h, 16),
					title: (vars.lastBackupStartTime) ? `Last backup happened ${moment(vars.lastBackupStartTime).fromNow()}` : "No backup has occoured yet...",
					description: vars.lastBackupDuration ? `Took: ${vars.lastBackupDuration}` : null,
					timestamp: new Date(),
					footer: {
						text: `Command executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			},
			console: `${(vars.lastBackupStartTime) ? `Last backup happened ${sS.c[sS.modules['backup'].color].c}${moment(vars.lastBackupStartTime).fromNow()}` : `${sS.c[sS.modules['backup'].color].c}No backup has occoured yet...`}${sS.c['reset'].c}`,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(
				[{
					"text": `${(vars.lastBackupStartTime) ? 'Last backup happened ' : 'No backup has occoured yet...'}`,
					"color": (vars.lastBackupStartTime) ? '' : sS.c[sS.modules['backup'].color].m
				}, {
					"text": `${(vars.lastBackupStartTime) ? moment(vars.lastBackupStartTime).fromNow() : ''}`,
					"color": (vars.lastBackupStartTime) ? sS.c[sS.modules['backup'].color].m : ''
				}]
			)}\n`
		}]
	},
	listModules: function(vars) {
		let enabledModules = "";
		let disabledModules = "";
		let enabledModulesIng = [{"text":"Enabled: "}];
		let disabledModulesIng = [{"text":"Disabled: "}];
		return Object.keys(vars.loadedModules).map(function(moduleName, index){
			let thisModule = vars.loadedModules[moduleName];
			thisModule.color = sS.c[sS.modules[moduleName].color].c;
			thisModule.enabled = sS.modules[moduleName].enabled;
			thisModule.description = sS.modules[moduleName].description;
			if (thisModule.enabled) {
				enabledModulesIng = enabledModulesIng.concat([{
					"text": `\n  ${moduleName} `,
					"color": sS.c[sS.modules[moduleName].color].m
				}, {
					"text": `[`,
					"color": "white"
				}, {
					"text": `${thisModule.process ? 'R' : 'S'}`,
					"color": thisModule.process ? sS.c['green'].m : sS.c['red'].m
				}, {
					"text": `]`,
					"color": "white"
				}, {
					"text": !(index < Object.keys(vars.loadedModules).length-1) ? '\n' : ''
				}])
				enabledModules += `${thisModule.color}${moduleName} ${sS.c['reset'].c}[${thisModule.process ? `${sS.c['green'].c}R${sS.c['reset'].c}` : `${sS.c['red'].c}S${sS.c['reset'].c}`}]${sS.c['reset'].c}${!(index < Object.keys(vars.loadedModules).length-1) ? '' : vars.seperator }`
			} else {
				disabledModulesIng = disabledModulesIng.concat([{
					"text": `\n  ${moduleName} `,
					"color": sS.c[sS.modules[moduleName].color].m
				}, {
					"text": `[`,
					"color": "white"
				}, {
					"text": `${thisModule.process ? 'R' : 'S'}`,
					"color": thisModule.process ? sS.c['green'].m : sS.c['red'].m
				}, {
					"text": `]`,
					"color": "white"
				}])
				disabledModules += `${thisModule.color}${moduleName} ${sS.c['reset'].c}[${thisModule.process ? `${sS.c['green'].c}R${sS.c['reset'].c}` : `${sS.c['red'].c}S${sS.c['reset'].c}`}]${sS.c['reset'].c}${!(index < Object.keys(vars.loadedModules).length-1) ? '' : vars.seperator }`
			}
			return {
				discord : {
					string: null,
					embed: {
						color: parseInt(sS.c[sS.modules[moduleName].discordColor||sS.modules[moduleName].color].h, 16),
				    title: `${thisModule.name}`,
				    description: `${thisModule.description}`,
				    timestamp: new Date(),
				    footer: {
				      text: (vars.executionStartTime) ? `${(thisModule.process) ? 'Running' : 'Stopped'} • ${(thisModule.enabled) ? 'Enabled' : 'Disabled'} • Command executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}` : ``
						}
					}
				}
			};
		}).concat([{
			discord: ``,
			minecraft: `tellraw ${vars.user} ${JSON.stringify(enabledModulesIng.concat(disabledModulesIng))}\n`,
			console: `\n${sS.c['brightCyan'].c}Enabled wrapper modules${sS.c['reset'].c}: ${enabledModules}\n`+`${sS.c['brightCyan'].c}Disabled wrapper modules${sS.c['reset'].c}: ${disabledModules}\n`
		}])
	}
};
