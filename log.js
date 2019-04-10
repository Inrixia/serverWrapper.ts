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

/*
/ Discord embed object
/ https://anidiots.guide/first-bot/using-embeds-in-messages
/ https://discordapp.com/developers/docs/resources/channel#embed-object-embed-structure
*/

const logFunctions = {
	loadModuleFunctions: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Loaded${sS.c['reset'].c} ${vars.color.c}${vars.name}${sS.c['reset'].c}'s functions\n`,
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
			console: `${sS.c['brightCyan'].c}Killed Module${sS.c['reset'].c}: ${vars.color.c}${vars.name}${sS.c['reset'].c}\n`,
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
	killModule_notRunning: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Module${sS.c['reset'].c} ${vars.color.c}${vars.name}${sS.c['reset'].c} is not running...\n`,
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
	commandNotFound: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}The command ${sS.c['reset'].c}"${vars.message.string}" could not be matched to a known command...\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(vars.color.h, 16),
					title: `The command "${vars.message.string}" could not be matched to a known command...`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Command executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			}
		}]
	},
	startModule: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Started module${sS.c['reset'].c}: ${vars.color.c}${vars.name}${sS.c['reset'].c}\n`,
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
	startModule_alreadyRunning: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Module${sS.c['reset'].c} ${vars.color.c}${vars.name}${sS.c['reset'].c} is already running...\n`,
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
			console: `${sS.c['brightCyan'].c}Enabled module${sS.c['reset'].c}: ${vars.color.c}${vars.name}${sS.c['reset'].c}\n`,
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
			console: `${sS.c['brightCyan'].c}Disabled module${sS.c['reset'].c}: ${vars.color.c}${vars.name}${sS.c['reset'].c}\n`,
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
					title: `Next backup in ${moment(vars.timeToNextBackup).fromNow()}`,
					description: null,
					timestamp: new Date(),
					footer: {
						text: `Command executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			},
			console: `${sS.c[sS.modules['backup'].color].c}Next Backup ${moment(vars.timeToNextBackup).fromNow()}${sS.c['reset'].c}\n`
		}]
	},
	lastBackup: function(vars) {
		let lastBackup = "";
		if (!vars.lastBackupStartTime) lastBackup = "No backup has occoured yet...";
		else lastBackup = `Last backup happened ${moment(vars.lastBackupStartTime).fromNow()}`
		return [{
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['backup'].discordColor||sS.modules['backup'].color].h, 16),
					title: lastBackup,
					description: vars.lastBackupDuration ? `Took: ${vars.lastBackupDuration}` : null,
					timestamp: new Date(),
					footer: {
						text: `Command executed in ${parseDuration(moment(vars.executionStartTime), moment(vars.executionEndTime))}`
					}
				}
			},
			console: `${sS.c[sS.modules['backup'].color].c}${lastBackup}${sS.c['reset'].c}\n`
		}]
	},
	listModules: function(vars) {
		var enabledModules = "";
		var disabledModules = "";
		return Object.keys(vars.loadedModules).map(function(moduleName, index){
			var thisModule = vars.loadedModules[moduleName];
			thisModule.color = sS.c[sS.modules[moduleName].color].c;
			thisModule.enabled = sS.modules[moduleName].enabled;
			thisModule.description = sS.modules[moduleName].description;
			if (thisModule.enabled) enabledModules += `${thisModule.color}${moduleName} ${sS.c['reset'].c}[${thisModule.process ? `${sS.c['green'].c}R${sS.c['reset'].c}` : `${sS.c['red'].c}S${sS.c['reset'].c}`}]${sS.c['reset'].c}${!(index < Object.keys(vars.loadedModules).length-1) ? '' : vars.seperator }`
			else disabledModules += `${thisModule.color}${moduleName} ${sS.c['reset'].c}[${thisModule.process ? `${sS.c['green'].c}R${sS.c['reset'].c}` : `${sS.c['red'].c}S${sS.c['reset'].c}`}]${sS.c['reset'].c}${!(index < Object.keys(vars.loadedModules).length-1) ? '' : vars.seperator }`
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
			console: `\n${sS.c['brightCyan'].c}Enabled wrapper modules${sS.c['reset'].c}: ${enabledModules}\n`+`${sS.c['brightCyan'].c}Disabled wrapper modules${sS.c['reset'].c}: ${disabledModules}\n\n`
		}])
	}
}

function parseDuration(startTime, endTime) {
	var duration = moment.duration(endTime.diff(startTime));
	var t = {
		ms: duration.milliseconds(),
		s: duration.seconds(),
		m: duration.minutes(),
		h: duration.hours()
	}
	t.ms = t.ms||1; // Make sure we dont have no time passed
	return `${(t.m>0) ? `${t.m}min, ` : ''}${(t.s>0) ? `${t.s}sec, ` : ''}${(t.ms>0) ? `${t.ms}ms` : ''}`;
}

function logOut(logObj) {
	if (!logObj.logTo) logObj.logTo = { console: true, discord: false }
	for (logInfo in logObj.logInfoArray) {
		logInfo = logObj.logInfoArray[logInfo]
		if (!logInfo || !logInfo.function) debug(`Invalid logInfo passed!! ${logInfoArray}`)
		else if (!logFunctions[logInfo.function]) debug(`Missing logging function for ${logInfo.function}!!`)
		else {
			var logStrings = logFunctions[logInfo.function](logInfo.vars);
			logStrings.forEach(function(logString) {
				if (logObj.logTo.console && logString.console) process.stdout.write(logString.console);
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
