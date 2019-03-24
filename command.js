const moment = require("moment");

// Set defaults
var serverSettings = {}
var moduleSettings = {}
var server = null;
var authErr = null;

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
		case 'discordMessage':
			processDiscordMessage(message.message)
			break;
		case 'consoleStdout':
			processCommand(message, 0);
			break;
		case 'pushSettings':
			serverSettings = message.serverSettings;
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
	if (moduleSettings.whitelisted_discord_users[message.author.id]) { // If user matches a whitelisted user
		var whitelisted_user = moduleSettings.whitelisted_discord_users[message.author.id];
		if (whitelisted_user['Username'] != message.author.username) {
			whitelisted_user['Username'] = message.author.username;
			saveSettings();
		}
		if (checkCommandAuth(whitelisted_user.allowedCommands, message)) return true;
	}
	for (role_index in message.member.roles) {
		discord_role = message.member.roles[role_index];
		if (discord_role.id in moduleSettings.whitelisted_discord_roles) { // If user has a whitelisted role
			var whitelisted_role = moduleSettings.whitelisted_discord_roles[discord_role.id];
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
		message: { function: 'discordStdin', string: authErr }
	});
	authErr = null;
	return false;
}

function processDiscordMessage(message) {
	// "Mod" role id: 344286675691896832
	// "Admin" role id: 278046497789181954
	if ((message.string[0] == '~' || message.string[0] == '!') && checkDiscordAuth(message)) { // User is allowed to run this command
		process.stdout.write(`[${message.author.username}]: ${message.string.trim()}\n`);
		if (message.string[0] == '~') processCommand(message, 0) // Message is a wrapperCommand
		else if (message.string[0] == '!') process.send({ function: 'serverStdin', string: message.string.slice(1,message.length).trim()+'\n' }) // Message is a serverCommand
	}
}

function processCommand(command, startIndex) {
	var string = command.string.replace(/\s\s+/g, ' '); // Compact multiple spaces/tabs down to one
	var logInfoArray = [];
	var message = {
		function: null,
		args: getCommandArgs(string),
		logTo: {
			console: true,
			discord: (command.author != undefined)
		}
	};
	if (commandMatch(string, startIndex, '~restartAllModules')) message.function = 'restartAllModules';
	else if (commandMatch(string, startIndex, '~unloadAllModules')) message.function = 'unloadAllModules';
	else if (commandMatch(string, startIndex, '~reloadModules')) message.function = 'reloadModules';
	else if (commandMatch(string, startIndex, '~listModules')) message.function = 'listModules';
	else if (commandMatch(string, startIndex, '~enableModule')) message.function = 'enableModule';
	else if (commandMatch(string, startIndex, '~disableModule') && getCommandArgs(string)[1] != 'command') message.function = 'disableModule';
	else if (commandMatch(string, startIndex, '~reloadModule')) message.function = 'reloadModule';
	else if (commandMatch(string, startIndex, '~killModule')) message.function = 'killModule';
	else if (commandMatch(string, startIndex, '~startModule')) message.function = 'startModule';
	else if (commandMatch(string, startIndex, '~restartModule')) message.function = 'restartModule';
	else if (commandMatch(string, startIndex, '~loadModuleFunctions')) message.function = 'loadModuleFunctions';
	else if (commandMatch(string, startIndex, '~loadSettings')) message.function = 'loadSettings';
	else if (commandMatch(string, startIndex, '~saveSettings')) saveSettings();
	else if (commandMatch(string, startIndex, '~cw_add')) logInfoArray = commandWhitelistAdd({command: command, args: message.args});
	else if (commandMatch(string, startIndex, '~cw_remove')) logInfoArray = commandWhitelistRemove({command: command, args: message.args});
	else if (commandMatch(string, startIndex, '~cw_removeall')) logInfoArray = commandWhitelistRemove({command: command, args: message.args});

	if (logInfoArray) process.send({
		function: 'unicast',
		module: 'log',
		message: { function: 'log', logObj: { logInfoArray: logInfoArray, logTo: message.logTo } }
	});
	if (message.function) process.send(message);
}

function commandWhitelistAdd(obj) {
	// ~commandwhitelist add !list @Inrix 1 hour
	// ~commandwhitelist remove !list @Inrix 1 hour
	if (obj.command.mentions.users.first.id) {
		var whitelisted_object = moduleSettings.whitelisted_discord_users[obj.command.mentions.users.first.id];
		whitelisted_object.Username = obj.command.mentions.users.first.username;
	} else if (obj.command.mentions.roles.first.id) {
		var whitelisted_object = moduleSettings.whitelisted_discord_roles[obj.command.mentions.roles.first.id];
		whitelisted_object.Name = obj.command.mentions.roles.first.name;
	}
	if (!whitelisted_object.allowAllCommands) whitelisted_object.allowAllCommands = false;

	if (!whitelisted_object.allowedCommands) whitelisted_object.allowedCommands = {}
	var expiresin = obj.args[3] ? new moment().add(obj.args[3], obj.args[4]) : false;
	whitelisted_object.allowedCommands[obj.args[1]] = {
		"assignedAt": new Date(),
		"assignedBy": {
			"Username": obj.command.author.username,
			"discord_id": obj.command.author.id
		},
		"expiresAt": expiresin, // If the user specifies a expiery time set it, otherwise use infinite
		"expired": false
	}
	saveSettings();
	return [{
		function: 'cw_add',
		vars: {
			args: obj.args,
			expiresin: expiresin.fromNow(),
			whitelisted_object: whitelisted_object
		}
	}]
}

function commandWhitelistRemove(obj) {
	if (obj.command.mentions.users.first.id) var whitelisted_object = moduleSettings.whitelisted_discord_users[obj.command.mentions.users.first.id];
	else if (obj.command.mentions.roles.first.id) var whitelisted_object = moduleSettings.whitelisted_discord_roles[obj.command.mentions.roles.first.id];

	if (obj.args[0] == "~cw_removeall") {
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
				args: obj.args,
				whitelisted_object: whitelisted_object
			}
		}]
		delete whitelisted_object.allowedCommands[obj.args[1]];
	}
	saveSettings();
}

function getCommandArgs(string) {
	return string.split(" ");
}

function commandMatch(string, startIndex, command) {
	var commandLength = command.length;
	if (string.toLowerCase().slice(startIndex, commandLength) == command.toLowerCase()) return true;
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

function saveSettings() {
	serverSettings.modules['command'].settings = moduleSettings;
	process.send({ function: 'saveSettings', serverSettings: serverSettings })
}
