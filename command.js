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
			if (message.string.slice(0, command.length) == command) return true; // If the command beginning matches return true
		} else {
			authErr = 'Allowed use of this command has expired.'
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

function processCommand(message, startIndex) {
	var string = message.string.replace(/\s\s+/g, ' '); // Compact multiple spaces/tabs down to one
	if (commandMatch(string, startIndex, '~restartAllModules')) process.send({function: 'restartAllModules'});
	else if (commandMatch(string, startIndex, '~unloadAllModules')) process.send({function: 'unloadAllModules'});
	else if (commandMatch(string, startIndex, '~reloadModules')) process.send({function: 'reloadModules'});
	else if (commandMatch(string, startIndex, '~reloadModules')) process.send({function: 'reloadModules'});
	else if (commandMatch(string, startIndex, '~listModules')) process.send({function: 'listModules'});
	else if (commandMatch(string, startIndex, '~enableModule')) process.send({ function: 'enableModule', args: getCommandArgs(string) })
	else if (commandMatch(string, startIndex, '~disableModule') && getCommandArgs(string)[1] != 'command') process.send({ function: 'disableModule', args: getCommandArgs(string) })
	else if (commandMatch(string, startIndex, '~reloadModule')) process.send({ function: 'reloadModule', args: getCommandArgs(string) })
	else if (commandMatch(string, startIndex, '~killModule')) process.send({function: 'killModule', args: getCommandArgs(string) });
	else if (commandMatch(string, startIndex, '~startModule')) process.send({function: 'startModule', args: getCommandArgs(string) });
	else if (commandMatch(string, startIndex, '~restartModule')) process.send({function: 'restartModule', args: getCommandArgs(string) });
	else if (commandMatch(string, startIndex, '~loadModuleFunctions')) process.send({function: 'loadModuleFunctions', args: getCommandArgs(string) });
	else if (commandMatch(string, startIndex, '~loadSettings')) process.send({function: 'loadSettings' });
	else if (commandMatch(string, startIndex, '~saveSettings')) process.send({function: 'saveSettings' });
	else if (commandMatch(string, startIndex, '~cw_add')) commandWhitelistAdd(message, getCommandArgs(string));
	else if (commandMatch(string, startIndex, '~cw_remove')) commandWhitelistRemove(message, getCommandArgs(string));
	else if (commandMatch(string, startIndex, '~cw_removeall')) commandWhitelistRemove(message, getCommandArgs(string));
}

function commandWhitelistAdd(message, args) {
	// ~commandwhitelist add !list @Inrix 1 hour
	// ~commandwhitelist remove !list @Inrix 1 hour
	if (message.mentions.users.first.id) {
		var whitelisted_object = moduleSettings.whitelisted_discord_users[message.mentions.users.first.id];
		whitelisted_object.Username = message.mentions.users.first.username;
	} else if (message.mentions.roles.first.id) {
		var whitelisted_object = moduleSettings.whitelisted_discord_roles[message.mentions.roles.first.id];
		whitelisted_object.Name = message.mentions.roles.first.name;
	}
	if (!whitelisted_object.allowAllCommands) whitelisted_object.allowAllCommands = false;

	if (!whitelisted_object.allowedCommands) whitelisted_object.allowedCommands = {}
	whitelisted_object.allowedCommands[args[1]] = {
		"assignedAt": new Date(),
		"assignedBy": {
			"Username": message.author.username,
			"discord_id": message.author.id
		},
		"expiresAt": args[3] ? new moment().add(args[3], args[4]) : false, // If the user specifies a expiery time set it, otherwise use infinite
		"expired": false
	}
	saveSettings();
}

function commandWhitelistRemove(message, args) {
	if (message.mentions.users.first.id) var whitelisted_object = moduleSettings.whitelisted_discord_users[message.mentions.users.first.id];
	else if (message.mentions.roles.first.id) var whitelisted_object = moduleSettings.whitelisted_discord_roles[message.mentions.roles.first.id];

	if (args[0] == "~cw_removeall") delete whitelisted_object;
	else delete whitelisted_object.allowedCommands[args[1]];
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
