// Import core packages
const moment = require("moment");
const fs = require("fs")

// Set defaults
var sS = {} // serverSettings
var mS = {} // moduleSettings
var server = null;
var authErr = null;
var commands = {};
var commandGroupings = {};

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			sS = message.sS;
			mS = sS.modules['command'].settings;
			loadCommands();
			break;
		case 'kill':
			process.exit();
			break;
		case 'discordMessage':
			processDiscordMessage(message.message);
			break;
		case 'consoleStdout':
			processCommand(message);
			break;
		case 'serverStdout':
			processServerMessage(message);
			break;
		case 'pushSettings':
			sS = message.sS;
			mS = sS.modules['command'].settings;
			break;
	}
});

function checkCommandAuth(allowedCommands, message) {
	for (command in allowedCommands) {
		if (!allowedCommands[command.toLowerCase()].expired && (allowedCommands[command.toLowerCase()].expiresAt === false || new Date(allowedCommands[command.toLowerCase()].expiresAt) > new Date())) { // If permission has not expired
			if (command == "*") return true;
			else if (command == "!*" && message.string.slice(0, 1) == "!") return true;
			else if (command == "~*" && message.string.slice(0, 1) == "~") return true;
			if (message.string.slice(0, command.length) == command) return true; // If the command beginning matches return true
		} else {
			if (allowedCommands[command.toLowerCase()].expired && (message.string.slice(0, command.length) == command)) authErr = 'Allowed use of this command has expired.';
			if (!allowedCommands[command.toLowerCase()].expired) {
				allowedCommands[command.toLowerCase()].expired = true;
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
	if ((message.string[0] == '~' || message.string[0] == '!' || message.string[0] == '?') && checkDiscordAuth(message)) { // User is allowed to run this command
		process.stdout.write(`[${sS.c['brightCyan'].c}${message.author.username}${sS.c['reset'].c}]: ${message.string.trim()}\n`);
		if (message.string[0] == '~' || message.string[0] == '?') processCommand(message) // Message is a wrapperCommand or helpCommand
		else if (message.string[0] == '!') process.send({ function: 'serverStdin', string: message.string.slice(1,message.length).trim()+'\n' }) // Message is a serverCommand
	}
}

function processServerMessage(message) {
	message.string = message.string.replace('\n', '');
	let commandString = null;
	let user = null;
	let commandType = '';
	if (message.string.indexOf('> ~') > -1) commandType = '~';
	else if (message.string.indexOf('> !') > -1) commandType = '!';
	else if (message.string.indexOf('> ?') > -1) commandType = '?';
	else return;
	commandString = message.string.slice(message.string.indexOf('> '+commandType)+2, message.string.length)
	user = message.string.slice(message.string.indexOf('<')+1, message.string.indexOf('> '+commandType))
	fs.readFile('./ops.json', null, function(err, ops) {
		if (err) debug(err);
		else {
			ops = JSON.parse(ops);
			if (getObj(ops, 'name', user)) {
				processCommand({ string: commandString, minecraft: true, user: user })
			}
		}
	})

}

class command {
	constructor(obj) {
		this.title = obj.title;
		this.name = obj.name;
		this.description = obj.description;
		this.exeFunc = obj.exeFunc;
		commands[this.name.toLowerCase()] = this;
	}

	execute(message) {
		if (message.string[0] == '~') {
			var logInfoArray = this.exeFunc(message);
			if (logInfoArray) process.send({
				function: 'unicast',
				module: 'log',
				message: { function: 'log', logObj: { logInfoArray: logInfoArray, logTo: message.logTo } }
			});
		} else if (message.string[0] == '?') this.help(message);
	}

	help(message) { // Outputs help info for a command
		process.send({
			function: 'unicast',
			module: 'log',
			message: {
				function: 'log',
				logObj: {
					logInfoArray: [{
						function: 'help',
						vars: this.description
					}],
					logTo: message.logTo
				}
			}
		})
	}

	helpAll(message) { // Outputs list of enabled commands
		let	helpSummary = {
			console: ``,
			minecraft: [],
			discord: {
				string: null,
				embed: {
					title: "serverWrapper.js Command Info",
					description: "Currently enabled commands.",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: []
				}
			}
		};
		let groupSummary = {};
		Object.keys(commands).forEach(c => {
			if (!groupSummary[commands[c].description.grouping]) groupSummary[commands[c].description.grouping] = {console: ``, minecraft: [], discord: ``};
			groupSummary[commands[c].description.grouping].console += `${sS.c['brightWhite'].c}~${commands[c].name}${sS.c['reset'].c} ${((commands[c].description||{}).summary)||'Missing command summary!'}\n`;
			groupSummary[commands[c].description.grouping].minecraft.push({
				"text": `~${commands[c].name} `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `${((commands[c].description||{}).summary)||'Missing command summary!'}\n`,
				"color": sS.c['white'].m
			})
			groupSummary[commands[c].description.grouping].discord += `**~${commands[c].name}** ${((commands[c].description||{}).summary)||'Missing command summary!'}\n`
		});
		Object.keys(groupSummary).forEach(g => {
			helpSummary.console += `${sS.c[commandGroupings[g]].c}${g}${sS.c['reset'].c}\n${groupSummary[g].console}`;
			groupSummary[g].minecraft.push({
				"text": '\n\n'+g,
				"color": sS.c[commandGroupings[g]].m
			})
			helpSummary.minecraft.concat(groupSummary[g].minecraft);
			helpSummary.discord.embed.fields.push({
				name: g,
				value: groupSummary[g].discord
			})
		});
		process.send({
			function: 'unicast',
			module: 'log',
			message: {
				function: 'log',
				logObj: {
					logInfoArray: [{
						function: 'help',
						vars: helpSummary
					}],
					logTo: message.logTo
				}
			}
		})
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
		discord: (message.author) ? { channel: message.channel.id } : null,
		minecraft: message.minecraft,
		user: message.user
	};
	message.args = getCommandArgs(message.string);
	if(!Object.keys(commands).some(function (commandName) {
		if (commandMatch(message.string.slice(1, message.string.length), commandName)) {
			commands[commandName.toLowerCase()].execute(message);
			return true;
		}
		return false;
	}) && message.string[0] == '~' || message.string[0] == '!') process.send({
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
	return string.split(" ")||string;
}

function commandMatch(string, commandString) {
	if (string.toLowerCase() == commandString.toLowerCase()) return true; // If its a identical match pass it
	commandString = commandString+' '; // Otherwise add a space to avoid continuous commands and check for dynamic commands
	if (string.toLowerCase().slice(0, commandString.length) == commandString.toLowerCase()) return true;
	return false;
}

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
		whitelisted_object.allowedCommands[message.args[1].toLowerCase()] = {
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
			delete whitelisted_object.allowedCommands[message.args[1].toLowerCase()];
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

function saveSettings(logTo) {
	sS.modules['command'].settings = mS;
	process.send({ function: 'saveSettings', sS: sS, logTo: logTo })
}

if (!('toJSON' in Error.prototype)) Object.defineProperty(Error.prototype, 'toJSON', {
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

function getObj(parentObject, childObjectProperty, childObjectValue) {
	return parentObject.find(function(childObject) { return childObject[childObjectProperty] === childObjectValue; })
}

/*
/	Begin command definitions
*/

function loadCommands() {
	commandGroupings = {
		'Wrapper Core': 'cyan',
		'Command': sS.modules['command'].color||'brightGreen',
		'Backups': sS.modules['backup'].color||'brightRed',
		'Minecraft': sS.modules['nbt'].color||'yellow',
		'Utility': sS.modules['math'].color||'brightMagenta'
	}
	new command({
		name: 'help',
		exeFunc: function(message) {
			if (message.args[1]) commands[message.args[1].toLowerCase()].help(message);
			else this.helpAll(message);
		},
		description: {
			grouping: 'Wrapper Core',
			summary: `Returns all commands or gives info on a specific command given.`,
			console: `${sS.c['brightWhite'].c}Returns all commands or gives info on a specific command given. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~help listmodules ${sS.c['reset'].c}or ${sS.c['yellow'].c}?listmodules${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Returns all commands or gives info on a specific command given. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
			}, {
				"text": `~help listmodules`,
				"color": sS.c['yellow'].m
			}, {
				"text": ` or `,
				"color": sS.c['white'].m
			}, {
				"text": `?listmodules`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Help! I have fallen and cant get up.",
					description: "~help",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Returns all commands or gives info on a specific command given."
					}, {
						name: "Examples",
						value: "~help listmodules **or** ?listmodules"
					}]
				}
			}
		}
	});
	// Wrapper passthrough commands
	new command({
		name: 'restartAllModules', exeFunc: command.toWrapper(),
		description: {
			grouping: 'Wrapper Core',
			summary: `Restarts all modules`,
			console: `${sS.c['brightWhite'].c}Restarts all modules. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~restartallmodules${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Restarts all modules. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example:`,
				"color": sS.c['white'].m
				}, {
				"text": `~restartallmodules.`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Restart All Modules",
					description: "~restartallmodules",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Restarts all modules."
					}, {
						name: "Example",
						value: "~restartallmodules"
					}]
				}
			}
		}
	});
	new command({
		name: 'unloadAllModules', exeFunc: command.toWrapper(),
		description: {
			grouping: 'Wrapper Core',
			summary: `Stops and unloads all modules.`,
			console: `${sS.c['brightWhite'].c}Stops and unloads all modules except command and log. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~unloadallmodules${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Stops and unloads all modules except command and log. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example:`,
				"color": sS.c['white'].m
				}, {
				"text": `~unloadallmodules.`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Unload All Modules",
					description: "~unloadallmodules",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Stops and unloads all modules except command and log."
					}, {
						name: "Example",
						value: "~unloadallmodules."
					}]
				}
			}
		}
	});
	new command({
		name: 'reloadModules', exeFunc: command.toWrapper(),
		description: {
			grouping: 'Wrapper Core',
			summary: `Reloads and restarts all modules.`,
			console: `${sS.c['brightWhite'].c}Reloads and restarts all modules. Will load and run any changes to modules. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~reloadmodules{sS.c['reset'].c}`,
			minecraft: [{
					"text": `Reloads and restarts all modules. Will load and run any changes to modules. `,
					"color": sS.c['brightWhite'].m
				}, {
					"text": `Example:`,
					"color": sS.c['white'].m
					}, {
					"text": `~reloadmodules.`,
					"color": sS.c['yellow'].m
				}],
			discord: {
				string: null,
				embed: {
					title: "Reload Modules",
					description: "~reloadmodules",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Reloads and restarts all modules. Will load and run any changes to modules."
					}, {
						name: "Example",
						value: "~reloadmodules."
					}]
				}
			}
		}
	});
	new command({
		name: 'listModules', exeFunc: command.toWrapper(),
		description: {
			grouping: 'Wrapper Core',
			summary: `Shows status of all modules currently installed in the wrapper.`,
			console: `${sS.c['brightWhite'].c}Shows status of all modules currently installed in the wrapper. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~listmodules${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Lists all modules currently insalled in the wrapper.`,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example:`,
				"color": sS.c['white'].m
				}, {
				"text": `~listmodules`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "List Modules",
					description: "~listmodules",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Shows status of all modules currently installed in the wrapper."
					}, {
						name: "Example",
						value: "~listmudles."
						}]
					}
				}
			}
	});
	new command({
		name: 'enableModule', exeFunc: command.toWrapper(),
		description: {
			grouping: 'Wrapper Core',
			summary: `Enables any given module.`,
			console: `${sS.c['brightWhite'].c}Enables any given module. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~enablemodule discord${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Enables any given module. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example:`,
				"color": sS.c['white'].m
				}, {
				"text": `~enablemodule discord.`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Enable Module",
					description: "~enablemodule discord",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Enables any given module. Excepts an optional parameter (true), Saves the change made to any setting."
					}, {
						name: "Example",
						value: "~enablemodule discord."
					}]
				}
			}
		}
	});
	new command({
		name: 'disableModule', exeFunc: command.toWrapper(),
		description: {
			grouping: 'Wrapper Core',
			summary: `Disables any given module.`,
			console: `${sS.c['brightWhite'].c}Disables any given module. Excepts an optional parameter which if true, saves the updated settings. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~disablemodule discord true${sS.c['reset'].c}`,
			minecraft: [{
					"text": `Disables any given module. Excepts an optional parameter which if true, saves the updated settings.`,
					"color": sS.c['brightWhite'].m
				}, {
					"text": `Example:`,
					"color": sS.c['white'].m
					}, {
					"text": `~diablemodule discord true.`,
					"color": sS.c['yellow'].m
				}],
			discord: {
				string: null,
				embed: {
					title: "Disable Module",
					description: "~diablemodule discord",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Disables any given module. Excepts an optional parameter which if true, saves the updated settings."
					}, {
						name: "Example",
						value: "~diablemodule discord true."
					}]
				}
			}
		}
	});
	new command({
		name: 'reloadModule', exeFunc: command.toWrapper(),
		description: {
			grouping: 'Wrapper Core',
			summary: `Reloads any given module.`,
			console: `${sS.c['brightWhite'].c}Reloads any given module. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~reloadmodule discord.${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Reloads any given module. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example:`,
				"color": sS.c['white'].m
				}, {
				"text": `~reloadmodule discord.`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Reload Module",
					description: "~reloadmodule discord",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Reloads any given module."
					}, {
						name: "Example",
						value: "~reloadmodule discord."
					}]
				}
			}
		}
	});
	new command({
		name: 'killModule', exeFunc: command.toWrapper(),
		description: {
			grouping: 'Wrapper Core',
			summary: `Stops any given module.`,
			console: `${sS.c['brightWhite'].c}Stops any given module. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~killmodule discord${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Stops any given module.`,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example:`,
				"color": sS.c['white'].m
				}, {
				"text": `~killmodule discord.`,
				"color": sS.c['yellow'].m
			}]
		},
			discord: {
				string: null,
				embed: {
					title: "Kill Module",
					description: "~killmodule discord",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Stops any given module."
					}, {
						name: "Example",
						value: "~killmodule discord."
					}]
				}
			}
	});
	new command({
		name: 'startModule', exeFunc: command.toWrapper(),
		description: {
			grouping: 'Wrapper Core',
			summary: `Starts any given module.`,
			console: `${sS.c['brightWhite'].c}Starts any given module. ${sS.c['reset'].c}Example:${sS.c['yellow'].c}~startmodule discord.${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Starts any given module.`,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example:`,
				"color": sS.c['white'].m
				}, {
				"text": `~startmodule discord.`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Start Module",
					description: "~startmodule discord",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Starts any given module."
					}, {
						name: "Example",
						value: "~startmodule discord."
					}]
				}
			}
		}
	});
	new command({
		name: 'restartModule', exeFunc: command.toWrapper(),
		description: {
			grouping: 'Wrapper Core',
			summary: `Restarts any given module`,
			console: `${sS.c['brightWhite'].c}Restarts any given module. ${sS.c['reset'].c}Example:${sS.c['yellow'].c}~restartmodule discord.${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Restarts any given module.`,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example:`,
				"color": sS.c['white'].m
				}, {
				"text": `~restartmodule discord.`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Restart Module",
					description: "~restartmodule discord",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Restarts any given module."
					}, {
						name: "Example",
						value: "~restartmodule discord."
					}]
				}
			}
		}
	});
	new command({
		name: 'loadModuleFunctions', exeFunc: command.toWrapper(),
		description: {
			grouping: 'Wrapper Core',
			summary: `Loads any given modules functions.`,
			console: `${sS.c['brightWhite'].c}Loads any given modules functions. ${sS.c['reset'].c}Example:${sS.c['yellow'].c}~loadmodulefunction discord.${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Loads any given module functions. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example:`,
				"color": sS.c['white'].m
				}, {
				"text": `~loadmodulefunction discord.`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Load Module",
					description: "~loadmodulefunction discord",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Loads any given modules functions."
					}, {
						name: "Example",
						value: "~loadmodulefunction."
					}]
				}
			}
		}
	});
	new command({
		name: 'loadSettings', exeFunc: command.toWrapper(),
		description: {
			grouping: 'Wrapper Core',
			summary: `Load settings will load any changed settings.`,
			console: `${sS.c['brightWhite'].c}Load settings will load any changed settings. ${sS.c['reset'].c}Example:${sS.c['yellow'].c}~loadsettings${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Load settings will load any changed settings.`,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example:`,
				"color": sS.c['white'].m
				}, {
				"text": `~loadsettings.`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "load settings",
					description: "~loadsettings",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
							name: "Description",
							value: "Will load any changed settings."
						}, {
							name: "Example",
							value: "~loadsettings."
					}]
				}
			}
		}
	});
	new command({
		name: 'backupSettings', exeFunc: command.toWrapper(),
		description: {
			grouping: 'Wrapper Core',
			summary: `Backups all settings.`,
			console: `${sS.c['brightWhite'].c}Backups current wrapper settings to backup settings file. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~backupsettings${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Backups current wrapper settings to backup settings file. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example:`,
				"color": sS.c['white'].m
				}, {
				"text": `~backupsettings.`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Backup Settings",
					description: "~backupsettings",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Backups current wrapper settings to backup settings file."
					}, {
						name: "Example",
						value: "~backupsettings."
					}]
				}
			}
		}
	});
	new command({
		name: 'saveSettings', exeFunc: function(message){saveSettings(message.logTo)},
		description: {
			grouping: 'Wrapper Core',
			summary: `Saves current wrapper settings to settings file.`,
			console: `${sS.c['brightWhite'].c}Saves current wrapper settings to settings file. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~savesettings${sS.c['reset'].c}`,
			minecraft: [{
					"text": `Saves current wrapper settings to settings file. `,
					"color": sS.c['brightWhite'].m
				}, {
					"text": `Example:`,
					"color": sS.c['white'].m
					}, {
					"text": `~savesettings.`,
					"color": sS.c['yellow'].m
				}],
			discord: {
				string: null,
				embed: {
					title: "Save Settings",
					description: "~loadsettings",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Saves current wrapper settings to settings file."
					}, {
						name: "Example",
						value: "~savesettings."
					}]
				}
			}
		}
	});
	new command({
		name: 'cw_add', exeFunc: function(message){commandWhitelistAdd(message)},
		description: {
			grouping: 'Command',
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		}
	});
	new command({
		name: 'cw_remove', exeFunc: function(message){commandWhitelistAdd(message)},
		description: {
			grouping: 'Command',
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		}
	});
	new command({
		name: 'cw_removeall', exeFunc: function(message){commandWhitelistAdd(message)},
		description: {
			grouping: 'Command',
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		}
	});

	// backup commands
	new command({
		name: 'backup',
		exeFunc: function(message){
			process.send({
				function: 'unicast',
				module: 'backup',
				message: {
					function: 'runBackup',
					logTo: message.logTo
				}
			})
		},
		description: {
			grouping: 'Backups',
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		}
	});
	new command({
		name: 'startBackupInterval',
		exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'startBackupInterval', logTo: message.logTo} }) },
		description: {
			grouping: 'Backups',
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		}
	});
	new command({
		name: 'clearBackupInterval',
		exeFunc: function(message){
			process.send({ function: 'unicast', module: 'backup', message: {function: 'clearBackupInterval', logTo: message.logTo} })
		},
		description: {
			grouping: 'Backups',
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		}
	});
	new command({
		name: 'setBackupInterval',
		exeFunc: function(message){
			process.send({
				function: 'unicast',
				module: 'backup',
				message: {
					function: 'setBackupInterval',
					backupIntervalInHours: message.args[1],
					save: message.args[2],
					logTo: message.logTo
				}
			})
		},
		description: {
			grouping: 'Backups',
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		}
	});

	//new command({ name: 'backupdir_set', exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'setBackupDir', backupDir: message.args[1],save: message.args[2], logTo: message.logTo} }) } });
	new command({
		name: 'backupDir',
		exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'getBackupDir', logTo: message.logTo} }) },
		description: {
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		},
		description: {
			grouping: 'Backups',
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		}
	});
	new command({
		name: 'nextBackup',
		exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'nextBackup', logTo: message.logTo} }) },
		description: {
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		},
		description: {
			grouping: 'Backups',
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		}
	});
	new command({
		name: 'lastBackup',
		exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'lastBackup', logTo: message.logTo} }) },
		description: {
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		},
		description: {
			grouping: 'Backups',
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		}
	});

	// nbt commands
	new command({
		name: 'getSpawn',
		exeFunc: function(message){ process.send({ function: 'unicast', module: 'nbt', message: {function: 'getSpawn', logTo: message.logTo} }) },
		description: {
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		},
		description: {
			grouping: 'Minecraft',
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		}
	});

	// properties commands
	new command({
		name: 'getProperty',
		exeFunc: function(message){
			process.send({
				function: 'unicast',
				module: 'properties',
				message: {function: 'getProperty',
				property: message.args[1],
				logTo: message.logTo}
			})
		},
		description: {
			grouping: 'Minecraft',
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		}
	});
	new command({
		name: 'getProperties',
		exeFunc: function(message){ process.send({ function: 'unicast', module: 'properties', message: {function: 'getProperties', logTo: message.logTo} }) },
		description: {
			grouping: 'Minecraft',
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		}
	});

	// straighthrough commands
	new command({
		name: 'tpc',
		exeFunc: function(message) {
			process.send({
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: [{
							function: 'tpc',
							vars: {
								args: message.args
							}
						}],
						logTo: message.logTo
					}
				}
			})
		},
		description: {
			grouping: 'Minecraft',
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		}
	})
	new command({
		name: 'tpr',
		exeFunc: function(message) {
			process.send({
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: [{
							function: 'tpr',
							vars: {
								args: message.args
							}
						}],
						logTo: message.logTo
					}
				}
			})
		},
		description: {
			grouping: 'Minecraft',
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		}
	})
	new command({
		name: 'qm',
		exeFunc: function(message) {
			process.send({
				function: 'unicast',
				module: 'math',
				message: {
					function: 'qm',
					question: message.args.slice(1, -1).join(' '),
					logTo: message.logTo
				}
			})
		},
		description: {
			grouping: 'Utility',
			summary: ``,
			console: ``,
			minecraft: {

			},
			discord: {

			}
		}
	})
}
