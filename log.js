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
			console: `${sS.c['brightCyan'].c}Loaded${sS.c['reset'].c} ${vars.color.c}${vars.name}${sS.c['reset'].c}'s Functions\n`,
			discord: ``
		}]
	},
	killModule: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Killed Module${sS.c['reset'].c}: ${vars.color.c}${vars.name}${sS.c['reset'].c}\n`,
			discord: ``
		}]
	},
	killModule_notRunning: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Module${sS.c['reset'].c} ${vars.color.c}${vars.name}${sS.c['reset'].c} is not running...\n`,
			discord: ``
		}]
	},
	startModule: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Started Module${sS.c['reset'].c}: ${vars.color.c}${vars.name}${sS.c['reset'].c}\n`,
			discord: ``
		}]
	},
	startModule_alreadyRunning: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Module${sS.c['reset'].c} ${vars.color.c}${vars.name}${sS.c['reset'].c} already running...\n`,
			discord: ``
		}]
	},
	enableModule: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Enabled Module${sS.c['reset'].c}: ${vars.color.c}${vars.name}${sS.c['reset'].c}\n`,
			discord: ``
		}]
	},
	disableModule: function(vars) {
		return [{
			console: `${sS.c['brightCyan'].c}Disabled Module${sS.c['reset'].c}: ${vars.color.c}${vars.name}${sS.c['reset'].c}\n`,
			discord: ``
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
			discord: { string: `Next Backup ${vars.timeToNextBackup.fromNow()}`, embed: null },
			console: `Next Backup ${vars.timeToNextBackup.fromNow()}\n`
		}]
	},
	lastBackup: function(vars) {
		return [{
			discord: { string: `Last Backup ${vars.lastBackupStartTime.fromNow()}`, embed: null },
			console: `Last Backup ${vars.lastBackupStartTime.fromNow()}\n`
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
				      text: (vars.executionStartTime) ? `${(thisModule.process) ? 'Running' : 'Stopped'} • ${(thisModule.enabled) ? 'Enabled' : 'Disabled'} • Command executed in ${parseDuration(vars.executionStartTime, new moment())}` : ``
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
