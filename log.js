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

const logFunctions = {
	loadFunctions: function(vars) {
		return {
			console: `${sS.c['brightCyan']}Loaded${sS.c['reset']} ${vars.color}${vars.name}${sS.c['reset']}'s Functions\n`,
			discord: ``
		}
	},
	kill: function(vars) {
		return {
			console: `${sS.c['brightCyan']}Killed Module${sS.c['reset']}: ${vars.color}${vars.name}${sS.c['reset']}\n`,
			discord: ``
		}
	},
	kill_notRunning: function(vars) {
		return {
			console: `${sS.c['brightCyan']}Module${sS.c['reset']} ${vars.color}${vars.name}${sS.c['reset']} is not running...\n`,
			discord: ``
		}
	},
	start: function(vars) {
		return {
			console: `${sS.c['brightCyan']}Started Module${sS.c['reset']}: ${vars.color}${vars.name}${sS.c['reset']}\n`,
			discord: ``
		}
	},
	start_alreadyRunning: function(vars) {
		return {
			console: `${sS.c['brightCyan']}Module${sS.c['reset']} ${vars.color}${vars.name}${sS.c['reset']} already running...\n`,
			discord: ``
		}
	},
	enable: function(vars) {
		return {
			console: `${sS.c['brightCyan']}Enabled Module${sS.c['reset']}: ${vars.color}${vars.name}${sS.c['reset']}\n`,
			discord: ``
		}
	},
	disable: function(vars) {
		return {
			console: `${sS.c['brightCyan']}Disabled Module${sS.c['reset']}: ${vars.color}${vars.name}${sS.c['reset']}\n`,
			discord: ``
		}
	},
	cw_removeall: function(vars) {
		return {
			discord: `Removed all commands from **${(vars.whitelisted_object.Username) ? vars.whitelisted_object.Username : vars.whitelisted_object.Name}**`
		}
	},
	cw_remove: function(vars) {
		return {
			discord: `Removed command **${vars.args[1]}** from **${(vars.whitelisted_object.Username) ? vars.whitelisted_object.Username : vars.whitelisted_object.Name}**`
		}
	},
	cw_add: function(vars) {
		return {
			discord: `Added command **${vars.args[1]}** to **${(vars.whitelisted_object.Username) ? vars.whitelisted_object.Username : vars.whitelisted_object.Name}** ${(vars.args[3]) ? `Expires ${vars.expiresin}` : ''}`
		}
	},
	nextBackup: function(vars) {
		return {
			discord: `Next Backup ${vars.timeToNextBackup.fromNow()}`,
			console: `Next Backup ${vars.timeToNextBackup.fromNow()}\n`
		}
	},
	last: function(vars) {
		return {
			discord: `Last Backup ${vars.lastBackupStartTime.fromNow()}`,
			console: `Last Backup ${vars.lastBackupStartTime.fromNow()}\n`
		}
	}
}


function logOut(logObj) {
	for (logInfo in logObj.logInfoArray) {
		logInfo = logObj.logInfoArray[logInfo]
		if (!logInfo || !logInfo.function) debug(`Invalid logInfo passed!! ${logInfoArray}`)
		else if (!logFunctions[logInfo.function]) debug(`Missing logging function for ${logInfo.function}!!`)
		else {
			var logStrings = logFunctions[logInfo.function](logInfo.vars);
			if (logObj.logTo.console && logStrings.console) process.stdout.write(logStrings.console);
			if (logObj.logTo.discord && logStrings.discord) process.send({
				function: 'unicast',
				module: 'discord',
				message: { function: 'discordStdin', string: logStrings.discord }
			});
		}
	}
}

/*
/ Util Functions
*/

function debug(stringOut) {
	try {
		if (typeof stringOut === 'string') process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset']} ${stringOut}\n\n`)
		else {
			process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset']}`);
			console.log(stringOut);
		}
	} catch (e) {
		process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset']} ${stringOut}\n\n`);
	}
}
