// Import core packages
const moment = require("moment");

// Set defaults
var sS = {} // serverSettings
var mS = {} // moduleSettings
var server = null;
var authErr = null;
var commands = {};

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			sS = message.sS;
			mS = sS.modules['command'].settings;
			break;
		case 'kill':
			process.exit();
			break;
		case 'discordMessage':
			processDiscordMessage(message.message)
			break;
		case 'consoleStdout':
			processCommand(message);
			break;
		case 'pushSettings':
			sS = message.sS;
			mS = sS.modules['command'].settings;
			break;
	}
});

function checkCommandAuth(allowedCommands, message) {
	for (command in allowedCommands) {
		if (!allowedCommands[command].expired && (allowedCommands[command].expiresAt === false || new Date(allowedCommands[command].expiresAt) > new Date())) { // If permission has not expired
			if (command == "*") return true;
			else if (command == "!*" && message.string.slice(0, 1) == "!") return true;
			else if (command == "~*" && message.string.slice(0, 1) == "~") return true;
			if (message.string.slice(0, command.length) == command) return true; // If the command beginning matches return true
		} else {
			if (allowedCommands[command].expired && (message.string.slice(0, command.length) == command)) authErr = 'Allowed use of this command has expired.';
			if (!allowedCommands[command].expired) {
				allowedCommands[command].expired = true;
				saveSettings();
			}
		}
	};
	if (!authErr) authErr = 'User not allowed to run this command.';
	return false;
}


function checkDiscordAuth(message) {
	if (mS.whitelisted_discord_users[message.author.id]) { // If user matches a whitelisted user
		var whitelisted_user = mS.whitelisted_discord_users[message.author.id];
		if (whitelisted_user['Username'] != message.author.username) {
			whitelisted_user['Username'] = message.author.username;
			saveSettings();
		}
		if (checkCommandAuth(whitelisted_user.allowedCommands, message)) return true;
	}
	for (role_index in message.member.roles) {
		discord_role = message.member.roles[role_index];
		if (discord_role.id in mS.whitelisted_discord_roles) { // If user has a whitelisted role
			var whitelisted_role = mS.whitelisted_discord_roles[discord_role.id];
			if (whitelisted_role['Name'] != discord_role.name) {
				whitelisted_role['Name'] = discord_role.name;
				saveSettings();
			}
			if (checkCommandAuth(whitelisted_role.allowedCommands, message)) return true;
		};
	}
	if (!authErr) authErr = 'User not whitelisted.';
	process.send({
		function: 'unicast',
		module: 'discord',
		message: { function: 'discordStdin', string: authErr+"\n" }
	});
	authErr = null;
	return false;
}

function processDiscordMessage(message) {
	// "Mod" role id: 344286675691896832
	// "Admin" role id: 278046497789181954
	if ((message.string[0] == '~' || message.string[0] == '!') && checkDiscordAuth(message)) { // User is allowed to run this command
		process.stdout.write(`[${sS.c['brightCyan'].c}${message.author.username}${sS.c['reset'].c}]: ${message.string.trim()}\n`);
		if (message.string[0] == '~' || message.string[0] == '?') processCommand(message) // Message is a wrapperCommand or helpCommand
		else if (message.string[0] == '!') process.send({ function: 'serverStdin', string: message.string.slice(1,message.length).trim()+'\n' }) // Message is a serverCommand
	}
}

class command {
	constructor(obj) {
		this.name = obj.name;
		this.description = obj.description;
		this.exeFunc = obj.exeFunc;
		commands[this.name] = this;
	}

	execute(message) {
		if (message.string[0] == '~') {
			var logInfoArray = this.exeFunc(message);
			if (logInfoArray) process.send({
				function: 'unicast',
				module: 'log',
				message: { function: 'log', logObj: { logInfoArray: logInfoArray, logTo: message.logTo } }
			});
		} else if (message.string[0] == '?') this.help(command);
	}

	help(message) {
	}

	static toWrapper() {
		return function(message) {
			message.function = this.name;
			process.send(message)
		}
	}
}

function processCommand(message) {
	let executionStartTime = new Date();
	message.string = message.string.replace(/\s\s+/g, ' '); // Compact multiple spaces/tabs down to one
	message.logTo = {
		console: true,
		discord: (message.author) ? { channel: message.channel.id } : null
	};
	message.args = getCommandArgs(message.string);
	if(!Object.keys(commands).some(function (commandName) {
		if (commandMatch(message.string.slice(1, message.string.length), commandName)) {
			commands[commandName].execute(message);
			return true;
		}
		return false;
	})) process.send({
		function: 'unicast',
		module: 'log',
		message: {
			function: 'log',
			logObj: {
				logInfoArray: [{
					function: 'commandNotFound',
					vars: {
						message: message,
						executionStartTime: executionStartTime,
						executionEndTime: new Date()
					}
				}],
				logTo: message.logTo
			}
		}
	})
}

function getCommandArgs(string) {
	return string.split(" ");
}

function commandMatch(string, commandString) {
	if (string.toLowerCase() == commandString.toLowerCase()) return true; // If its a identical match pass it
	commandString = commandString+' '; // Otherwise add a space to avoid continuous commands and check for dynamic commands
	if (string.toLowerCase().slice(0, commandString.length) == commandString.toLowerCase()) return true;
	return false;
}

new command({ name: 'restartAllModules', exeFunc: command.toWrapper() });
new command({ name: 'unloadAllModules', exeFunc: command.toWrapper() });
new command({ name: 'reloadModules', exeFunc: command.toWrapper() });
new command({ name: 'listModules', exeFunc: command.toWrapper() });
new command({ name: 'enableModule', exeFunc: command.toWrapper() });
new command({ name: 'disableModule', exeFunc: command.toWrapper() });
new command({ name: 'reloadModule', exeFunc: command.toWrapper() });
new command({ name: 'killModule', exeFunc: command.toWrapper() });
new command({ name: 'startModule', exeFunc: command.toWrapper() });
new command({ name: 'restartModule', exeFunc: command.toWrapper() });
new command({ name: 'loadModuleFunctions', exeFunc: command.toWrapper() });
new command({ name: 'loadSettings', exeFunc: command.toWrapper() });
new command({ name: 'saveSettings', exeFunc: function(){saveSettings()} });
new command({ name: 'cw_add', exeFunc: commandWhitelistAdd() });
new command({ name: 'cw_remove', exeFunc: commandWhitelistAdd() });
new command({ name: 'cw_removeall', exeFunc: commandWhitelistAdd() });
new command({ name: 'backup', exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'runBackup'} }) } });
new command({ name: 'backupinterval_start', exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'startBackupInterval'} }) } });
new command({ name: 'backupinterval_stop', exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'clearBackupInterval'} }) } });
new command({ name: 'backupinterval_set', exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'setBackupInterval', backupIntervalInHours: message.args[1], save: message.args[2]} }) } });
new command({ name: 'backupdir_set', exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'setBackupDir', backupDir: message.args[1],save: message.args[2]} }) } });
new command({ name: 'nextBackup', exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'nextBackup', logTo: message.logTo} }) } });
new command({ name: 'lastBackup', exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'lastBackup', logTo: message.logTo} }) } });

function commandWhitelistAdd() {
	return function(message) {
		// ~commandwhitelist add !list @Inrix 1 hour
		// ~commandwhitelist remove !list @Inrix 1 hour
		if (message.command.mentions.users[0].id) {
			var whitelisted_object = mS.whitelisted_discord_users[message.command.mentions.users[0].id];
			whitelisted_object.Username = message.command.mentions.users[0].username;
		} else if (message.command.mentions.roles[0].id) {
			var whitelisted_object = mS.whitelisted_discord_roles[message.command.mentions.roles[0].id];
			whitelisted_object.Name = message.command.mentions.roles[0].name;
		}
		if (!whitelisted_object.allowAllCommands) whitelisted_object.allowAllCommands = false;

		if (!whitelisted_object.allowedCommands) whitelisted_object.allowedCommands = {}
		var expiresin = message.args[3] ? new moment().add(message.args[3], message.args[4]) : false;
		whitelisted_object.allowedCommands[message.args[1]] = {
			"assignedAt": new Date(),
			"assignedBy": {
				"Username": message.command.author.username,
				"discord_id": message.command.author.id
			},
			"expiresAt": expiresin, // If the user specifies a expiery time set it, otherwise use infinite
			"expired": false
		}
		saveSettings();
		return [{
			function: 'cw_add',
			vars: {
				args: message.args,
				expiresin: expiresin ? expiresin.fromNow() : false,
				whitelisted_object: whitelisted_object
			}
		}]
	}
}

function commandWhitelistRemove() {
	return function(message) {
		if (message.command.mentions.users[0].id) var whitelisted_object = mS.whitelisted_discord_users[message.command.mentions.users[0].id];
		else if (message.command.mentions.roles[0].id) var whitelisted_object = mS.whitelisted_discord_roles[message.command.mentions.roles[0].id];

		if (message.args[0] == "~cw_removeall") {
			delete whitelisted_object;
			return [{
				function: 'cw_removeall',
				vars: {
					whitelisted_object: whitelisted_object
				}
			}]
		} else {
			return [{
				function: 'cw_remove',
				vars: {
					args: message.args,
					whitelisted_object: whitelisted_object
				}
			}]
			delete whitelisted_object.allowedCommands[message.args[1]];
		}
		saveSettings();
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

function saveSettings() {
	sS.modules['command'].settings = mS;
	process.send({ function: 'saveSettings', sS: sS })
}
