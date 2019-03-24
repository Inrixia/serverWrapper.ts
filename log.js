const moment = require("moment");

// Set defaults
var serverSettings = {};
var moduleSettings = {};

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			serverSettings = message.serverSettings;
			moduleSettings = serverSettings.modules['command'].settings;
			break;
		case 'kill':
			process.exit();
			break;
		case 'log':
			logOut(message.logObj);
			break;
	}
});

const logFunctions = {
	loadFunctions: function(vars) {
		return {
			console: `\u001b[36;1mLoaded\u001b[0m ${vars.color}${vars.name}\u001b[0m's Functions\n`,
			discord: ``
		}
	},
	kill: function(vars) {
		return {
			console: `\u001b[36;1mKilled Module\u001b[0m: ${vars.color}${vars.name}\u001b[0m\n`,
			discord: ``
		}
	},
	start: function(vars) {
		return {
			console: `\u001b[36;1mStarted Module\u001b[0m: ${vars.color}${vars.name}\u001b[0m\n`,
			discord: ``
		}
	},
	enable: function(vars) {
		return {
			console: `\u001b[36;1mEnabled Module\u001b[0m: ${vars.color}${vars.name}\u001b[0m\n`,
			discord: ``
		}
	},
	disable: function(vars) {
		return {
			console: `\u001b[36;1mDisabled Module\u001b[0m: ${vars.color}${vars.name}\u001b[0m\n`,
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
	}
}


function logOut(logObj) {
	for (logInfo in logObj.logInfoArray) {
		logInfo = logObj.logInfoArray[logInfo]
		var logStrings = logFunctions[logInfo.function](logInfo.vars);
		if (logObj.logTo.console && logStrings.console) process.stdout.write(logStrings.console);
		if (logObj.logTo.discord && logStrings.discord) process.send({
			function: 'unicast',
			module: 'discord',
			message: { function: 'discordStdin', string: logStrings.discord }
		});
	}
}

/*
/ Util Functions
*/

function debug(stringOut) {
	try {
		if (typeof stringOut === 'string') process.stdout.write(`\n\u001b[41mDEBUG>\u001b[0m ${stringOut}\n\n`)
		else {
			process.stdout.write(`\n\u001b[41mDEBUG>\u001b[0m`);
			console.log(stringOut);
		}
	} catch (e) {
		process.stdout.write(`\n\u001b[41mDEBUG>\u001b[0m ${stringOut}\n\n`);
	}
}
