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

function commandWhitelistAdd(message) {
	// ~commandwhitelist add !list @Inrix 1 hour
	// ~commandwhitelist remove !list @Inrix 1 hour
	if (message.mentions.users[0].id) {
		var whitelisted_object = mS.whitelisted_discord_users[message.mentions.users[0].id];
		whitelisted_object.Username = message.mentions.users[0].username;
	} else if (message.mentions.roles[0].id) {
		var whitelisted_object = mS.whitelisted_discord_roles[message.mentions.roles[0].id];
		whitelisted_object.Name = message.mentions.roles[0].name;
	}
	if (!whitelisted_object.allowAllCommands) whitelisted_object.allowAllCommands = false;

	if (!whitelisted_object.allowedCommands) whitelisted_object.allowedCommands = {}
	let expiresin = message.args[3] ? new moment().add(message.args[3], message.args[4]) : false;
	whitelisted_object.allowedCommands[message.args[1].toLowerCase()] = {
		"assignedAt": new Date(),
		"assignedBy": {
			"Username": message.author.username,
			"discord_id": message.author.id
		},
		"expiresAt": expiresin, // If the user specifies a expiery time set it, otherwise use infinite
		"expired": false
	}
	saveSettings();
	return { wo: whitelisted_object, expiresin: expiresin };
}

function commandWhitelistRemove(message) {
	if (message.args[0] == "~cw_removeall") {
		let whitelisted_object = mS.whitelisted_discord_users[message.mentions.users[0].id];
		if (message.mentions.users[0].id) delete mS.whitelisted_discord_users[message.mentions.users[0].id];
		else if (message.mentions.roles[0].id) delete mS.whitelisted_discord_roles[message.mentions.roles[0].id];
		saveSettings();
		return whitelisted_object
	} else {
		let whitelisted_object = mS.whitelisted_discord_users[message.mentions.users[0].id].allowedCommands[message.args[1].toLowerCase()];
		if (message.mentions.users[0].id) delete mS.whitelisted_discord_users[message.mentions.users[0].id].allowedCommands[message.args[1].toLowerCase()];
		else if (message.mentions.roles[0].id) delete mS.whitelisted_discord_roles[message.mentions.roles[0].id].allowedCommands[message.args[1].toLowerCase()];
		saveSettings();
		return whitelisted_object
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
			console: `${sS.c['brightWhite'].c}Returns all commands or gives info on a specific command given. ${sS.c['reset'].c}\nExamples: ${sS.c['yellow'].c}~help ${sS.c['brightBlue'].c}listmodules ${sS.c['reset'].c}\n${sS.c['yellow'].c}?${sS.c['brightBlue'].c}listmodules${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Returns all commands or gives info on a specific command given. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Examples: \n`,
				"color": sS.c['white'].m
			}, {
				"text": `~help `,
				"color": sS.c['yellow'].m
			}, {
				"text": `listmodules\n`,
				"color": sS.c['brightBlue'].m
			}, {
				"text": `?`,
				"color": sS.c['yellow'].m
			}, {
				"text": `listmodules`,
				"color": sS.c['brightBlue'].m
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
						value: "**~help** listmodules\n**?**listmodules"
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
			console: `${sS.c['brightWhite'].c}Restarts all modules. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~restartAllModules${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Restarts all modules. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
				}, {
				"text": `~restartAllModules`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Restart All Modules",
					description: "~restartAllModules",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Restarts all modules."
					}, {
						name: "Example",
						value: "**~restartAllModules**"
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
			console: `${sS.c['brightWhite'].c}Stops and unloads all modules except command and log. ${sS.c['reset'].c}\nExample: ${sS.c['yellow'].c}~unloadAllModules${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Stops and unloads all modules except command and log.\n`,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
				}, {
				"text": `~unloadAllModules`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Unload All Modules",
					description: "~unloadAllModules",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Stops and unloads all modules except command and log."
					}, {
						name: "Example",
						value: "**~unloadAllModules**"
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
			console: `${sS.c['brightWhite'].c}Reloads and restarts all modules. Will load and run any changes to modules. ${sS.c['reset'].c}\nExample: ${sS.c['yellow'].c}~reloadModules${sS.c['reset'].c}`,
			minecraft: [{
					"text": `Reloads and restarts all modules. `,
					"color": sS.c['brightWhite'].m
				}, {
					"text": `Example: `,
					"color": sS.c['white'].m
					}, {
					"text": `~reloadModules`,
					"color": sS.c['yellow'].m
				}],
			discord: {
				string: null,
				embed: {
					title: "Reload Modules",
					description: "~reloadModules",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Reloads and restarts all modules. Will load and run any changes to modules."
					}, {
						name: "Example",
						value: "**~reloadModules**"
					}]
				}
			}
		}
	});
	new command({
		name: 'listModules', exeFunc: command.toWrapper(),
		description: {
			grouping: 'Wrapper Core',
			summary: `Gets status of all modules currently installed in the wrapper.`,
			console: `${sS.c['brightWhite'].c}Gets status of all modules currently installed. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~listModules${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Gets status of all modules currently insalled. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
				}, {
				"text": `~listModules`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "List Modules",
					description: "~listModules",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Gets status of all modules currently installed."
					}, {
						name: "Example",
						value: "**~listModules**"
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
			console: `${sS.c['brightWhite'].c}Enables any given module and saves settings if true. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~enableModule ${sS.c['brightBlue'].c}discord ${sS.c['orange'].c}true${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Enables any given module and saves settings if true. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
				}, {
				"text": `~enableModule discord`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Enable Module",
					description: "~enableModule",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Enables any given module. Excepts an optional parameter (true), Saves the change made to any setting."
					}, {
						name: "Example",
						value: "**~enableModule** discord true"
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
			console: `${sS.c['brightWhite'].c}Disables any given module and saves settings if true. ${sS.c['reset'].c}\nExample: ${sS.c['yellow'].c}~disableModule ${sS.c['brightBlue'].c}discord ${sS.c['orange'].c}true${sS.c['reset'].c}`,
			minecraft: [{
					"text": `Disables any given module and saves settings if true.\n`,
					"color": sS.c['brightWhite'].m
				}, {
					"text": `Example: `,
					"color": sS.c['white'].m
					}, {
					"text": `~disableModule `,
					"color": sS.c['yellow'].m
				}, {
					"text": `discord `,
					"color": sS.c['brightBlue'].m
				}, {
					"text": `true`,
					"color": sS.c['yellow'].m
				}],
			discord: {
				string: null,
				embed: {
					title: "Disable Module",
					description: "~disableModule",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Disables any given module. Excepts an optional parameter which if true, saves the updated settings."
					}, {
						name: "Example",
						value: "**~disableModule** discord true"
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
			console: `${sS.c['brightWhite'].c}Reloads any given module. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~reloadModule ${sS.c['brightBlue'].c}discord${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Reloads any given module. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
				}, {
				"text": `~reloadModule `,
				"color": sS.c['yellow'].m
			}, {
				"text": `discord`,
				"color": sS.c['brightBlue'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Reload Module",
					description: "~reloadModule",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Reloads any given module."
					}, {
						name: "Example",
						value: "**~reloadModule** discord."
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
			console: `${sS.c['brightWhite'].c}Stops any given module. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~killModule ${sS.c['brightBlue'].c}discord${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Stops any given module. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
			}, {
				"text": `~killModule `,
				"color": sS.c['yellow'].m
			}, {
				"text": `discord`,
				"color": sS.c['brightBlue'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Kill Module",
					description: "~killModule",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Stops any given module."
					}, {
						name: "Example",
						value: "**~killModule** discord"
					}]
				}
			}
		}
	});
	new command({
		name: 'startModule', exeFunc: command.toWrapper(),
		description: {
			grouping: 'Wrapper Core',
			summary: `Starts any given module.`,
			console: `${sS.c['brightWhite'].c}Starts any given module. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~startModule ${sS.c['brightBlue'].c}discord${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Starts any given module. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
				}, {
				"text": `~startModule `,
				"color": sS.c['yellow'].m
			}, {
				"text": `discord`,
				"color": sS.c['brightBlue'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Start Module",
					description: "~startModule",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Starts any given module."
					}, {
						name: "Example",
						value: "**~startModule** discord"
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
			console: `${sS.c['brightWhite'].c}Restarts any given module. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~restartModule ${sS.c['brightBlue'].c}discord${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Restarts any given module. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
				}, {
				"text": `~restartModule `,
				"color": sS.c['yellow'].m
			}, {
				"text": `discord`,
				"color": sS.c['brightBlue'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Restart Module",
					description: "~restartModule",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Restarts any given module."
					}, {
						name: "Example",
						value: "**~restartModule** discord"
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
			console: `${sS.c['brightWhite'].c}Loads any given modules functions. ${sS.c['reset'].c}\nExample: ${sS.c['yellow'].c}~loadModuleFunctions ${sS.c['brightBlue'].c}discord${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Loads any given module functions.\n`,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
				}, {
				"text": `~loadModuleFunctions `,
				"color": sS.c['yellow'].m
			}, {
				"text": `discord`,
				"color": sS.c['brightBlue'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Load Module",
					description: "~loadModuleFunctions",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Loads any given modules functions."
					}, {
						name: "Example",
						value: "**~loadModuleFunctions** discord"
					}]
				}
			}
		}
	});
	new command({
		name: 'loadSettings', exeFunc: command.toWrapper(),
		description: {
			grouping: 'Wrapper Core',
			summary: `Loads wrapper settings file.`,
			console: `${sS.c['brightWhite'].c}Loads wrapper settings file. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~loadSettings${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Loads wrapper settings file. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
				}, {
				"text": `~loadSettings`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Load Settings",
					description: "~loadSettings",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
							name: "Description",
							value: "Loads wrapper settings file."
						}, {
							name: "Example",
							value: "**~loadSettings**"
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
			console: `${sS.c['brightWhite'].c}Backups current wrapper settings. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~backupSettings${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Backups current wrapper settings. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
				}, {
				"text": `~backupSettings`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Backup Settings",
					description: "~backupSettings",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Backups current wrapper settings."
					}, {
						name: "Example",
						value: "**~backupSettings**"
					}]
				}
			}
		}
	});
	new command({
		name: 'saveSettings', exeFunc: function(message){saveSettings(message.logTo)},
		description: {
			grouping: 'Wrapper Core',
			summary: `Saves current wrapper settings.`,
			console: `${sS.c['brightWhite'].c}Saves current wrapper settings. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~saveSettings${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Saves current wrapper settings. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
				}, {
				"text": `~saveSettings`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Save Settings",
					description: "~saveSettings",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Saves current wrapper settings."
					}, {
						name: "Example",
						value: "**~saveSettings**"
					}]
				}
			}
		}
	});
	new command({
		name: 'cw_add', exeFunc: function(message){
			let executionStartTime = new Date();
			process.send({
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: [{
							function: 'cw_add',
							vars: {
								args: message.args,
								executionStartTime: executionStartTime,
								executionEndTime: new Date(),
								cr: commandWhitelistAdd(message)
							}
						}],
						logTo: message.logTo
					}
				}
			})
		},
		description: {
			grouping: 'Command',
			summary: `Adds given whitelisted command to a discord role or user.\nFor a specific time if given, otherwise infinite.`,
			console: `${sS.c['white'].c}Adds given whitelisted command to a discord role or user. ${sS.c['reset'].c}\nExamples  [Discord Only]:\n${sS.c['yellow'].c}~cw_add ${sS.c['brightBlue'].c}~listmodules ${sS.c['orange'].c}@DiscordUser ${sS.c['cyan'].c}1 hour\n${sS.c['reset'].c}${sS.c['yellow'].c}~cw_add ${sS.c['brightBlue'].c}!forge tps ${sS.c['orange'].c}@DiscordUser\n${sS.c['reset'].c}${sS.c['yellow'].c}~cw_add ${sS.c['brightBlue'].c}!tp ${sS.c['orange'].c}@DiscordRole ${sS.c['cyan'].c}5.2 minutes\n${sS.c['reset'].c}${sS.c['yellow'].c}~cw_add ${sS.c['brightBlue'].c}~getSpawn ${sS.c['orange'].c}@DiscordRole${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Adds given whitelisted command to a discord role or user. For a specific time if given, otherwise infinite.\n`,
				"color": sS.c['brightWhite'].m
			}, {
        "text": `Examples [Discord Only]:\n`,
        "color": sS.c['white'].m
    	}, {
        "text": `~cw_add `,
        "color": sS.c['yellow'].m
			}, {
				"text": `~listmodules `,
				"color": sS.c['brightBlue'].m
    	}, {
        "text": `@DiscordUser `,
        "color": sS.c['brightRed'].m
			}, {
				"text": `1 hour\n`,
				"color": sS.c['cyan'].m
    	}, {
        "text": `~cw_add `,
        "color": sS.c['yellow'].m
			}, {
				"text": `"!forge tps" `,
				"color": sS.c['brightBlue'].m
    	}, {
        "text": `@DiscordUser\n`,
        "color": sS.c['brightRed'].m
			}, {
        "text": `~cw_add `,
        "color": sS.c['yellow'].m
			}, {
				"text": `!tp `,
				"color": sS.c['brightBlue'].m
    	}, {
        "text": `@DiscordRole `,
        "color": sS.c['brightRed'].m
			}, {
				"text": `5.2 minutes\n`,
				"color": sS.c['cyan'].m
    	}, {
        "text": `~cw_add `,
        "color": sS.c['yellow'].m
			}, {
				"text": `~getSpawn `,
				"color": sS.c['brightBlue'].m
    	}, {
        "text": `@DiscordRole `,
        "color": sS.c['brightRed'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Command Whitelist Remove",
					description: "~cw_removeall",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Adds given whitelisted command to a discord role or user. \nIf a time is specified the user/role will have access to the command for that duration. Otherwise the permission is given with no expiry."
					}, {
						name: "Examples [Discord Only]:",
						value: `**~cw_add** ~listModules @DiscordUser 1 hour\n**~cw_add** "forge tps" @DiscordUser\n**~cw_add** !tp @DiscordRole 5.2 minutes\n**~cw_add** ~getSpawn @DiscordRole`
					}]
				}
			}
		}
	});
	new command({
		name: 'cw_remove', exeFunc: function(message){
			let executionStartTime = new Date();
			process.send({
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: [{
							function: 'cw_remove',
							vars: {
								args: message.args,
								executionStartTime: executionStartTime,
								executionEndTime: new Date(),
								whitelisted_object: commandWhitelistRemove(message)
							}
						}],
						logTo: message.logTo
					}
				}
			})
		},
		description: {
			grouping: 'Command',
			summary: `Removes given whitelisted commands from a discord role or user.`,
			console: `${sS.c['white'].c}Removes given whitelisted commands from a discord role or user. ${sS.c['reset'].c}\nExamples:\n${sS.c['yellow'].c}~cw_remove ${sS.c['brightBlue'].c}@DiscordUser ${sS.c['brightWhite'].c}\n${sS.c['yellow'].c}~cw_remove ${sS.c['brightBlue'].c}@DiscordRole${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Removes given whitelisted commands from a discord role or user.\n`,
				"color": sS.c['brightWhite'].m
			}, {
        "text": `Examples:\n`,
        "color": sS.c['white'].m
    	}, {
        "text": `~cw_remove `,
        "color": sS.c['yellow'].m
			}, {
				"text": `@DiscordUser\n`,
				"color": sS.c['brightBlue'].m
    	}, {
        "text": `~cw_remove `,
        "color": sS.c['yellow'].m
			}, {
				"text": `@DiscordUser`,
				"color": sS.c['brightBlue'].m
    	}],
			discord: {
				string: null,
				embed: {
					title: "Command Whitelist Remove",
					description: "~cw_removeall",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Removes given whitelisted commands from a discord role or user."
					}, {
						name: "Example",
						value: "**~cw_remove** @DiscordUser\n**~cw_remove** @DiscordRole"
					}]
				}
			}
		}
	}),
	new command({
		name: 'cw_removeall', exeFunc: function(message){
			let executionStartTime = new Date();
			process.send({
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: [{
							function: 'cw_removeall',
							vars: {
								args: message.args,
								executionStartTime: executionStartTime,
								executionEndTime: new Date(),
								whitelisted_object: commandWhitelistRemove(message)
							}
						}],
						logTo: message.logTo
					}
				}
			})
		},
		description: {
			grouping: 'Command',
			summary: `Removes all whitelisted commands from a discord role or user.`,
			console: `${sS.c['white'].c}Removes all whitelisted commands from a discord role or user. ${sS.c['reset'].c}\nExample: ${sS.c['yellow'].c}~cw_removeall ${sS.c['brightBlue'].c}@DiscordUser\n${sS.c['yellow'].c}~cw_removeall ${sS.c['brightBlue'].c}@DiscordRole${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Removes all whitelisted commands from a discord role or user.\n`,
				"color": sS.c['brightWhite'].m
			}, {
        "text": `Examples:\n`,
        "color": sS.c['white'].m
    	}, {
        "text": `~cw_removeall `,
        "color": sS.c['yellow'].m
			}, {
				"text": `@DiscordUser\n`,
				"color": sS.c['brightBlue'].m
    	}, {
        "text": `~cw_removeall `,
        "color": sS.c['yellow'].m
			}, {
				"text": `@DiscordUser`,
				"color": sS.c['brightBlue'].m
    	}],
			discord: {
				string: null,
				embed: {
					title: "Command Whitelist Remove-All",
					description: "~cw_removeall",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Removes all whitelisted commands from a discord role or user."
					}, {
						name: "Examples",
						value: "**~cw_removeall** @DiscordUser\n**~cw_removeall** @DiscordRole"
					}]
				}
			}
		}
	}),

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
			summary: `Starts a backup.`,
			console: `${sS.c['white'].c}Starts a backup. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~backup${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Starts a backup. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": 'Example: ',
				"color": sS.c['white'].m
			}, {
				"text": '~backup ',
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Backup",
					description: "~backup",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Starts a backup."
					}, {
						name: "Example",
						value: "**~backup**"
					}]
				}
			}
		}
	}),
	new command({
		name: 'startBackupInterval',
		exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'startBackupInterval', logTo: message.logTo} }) },
		description: {
			grouping: 'Backups',
			summary: `Starts automatic backups.`,
			console: `${sS.c['white'].c}Starts automatic backups. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~startBackupInterval${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Starts automatic backups. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": 'Example: ',
				"color": sS.c['white'].m
			}, {
				"text": '~startBackupInterval ',
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Start Backup Interval",
					description: "~startBackupInterval",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Starts automatic backups."
					}, {
						name: "Example",
						value: "**~startBackupInterval**"
					}]
				}
			}
		}
	}),
	new command({
		name: 'clearBackupInterval',
		exeFunc: function(message){
			process.send({ function: 'unicast', module: 'backup', message: {function: 'clearBackupInterval', logTo: message.logTo} })
		},
		description: {
			grouping: 'Backups',
			summary: `Stops automatic backups.`,
			console: `${sS.c['white'].c}Stops automatic backups. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~clearBackupInterval${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Stops automatic backups. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": 'Example: ',
				"color": sS.c['white'].m
			}, {
				"text": '~clearBackupInterval ',
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Clear Backup Interval",
					description: "~clearBackupInterval",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Stops automatic backups."
					}, {
						name: "Example",
						value: "**~clearBackupInterval**"
					}]
				}
			}
		}
	}),
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
			summary: `Sets backup interval.`,
			console: `${sS.c['white'].c}Sets backup interval. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~setBackupInterval${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Sets backup interval. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": 'Example: ',
				"color": sS.c['white'].m
			}, {
				"text": '~setBackupInterval ',
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Set Backup Interval",
					description: "~setBackupInterval",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Sets backup interval."
					}, {
						name: "Example",
						value: "**~setBackupInterval**"
					}]
				}
			}
		}
	}),

	//new command({ name: 'backupdir_set', exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'setBackupDir', backupDir: message.args[1],save: message.args[2], logTo: message.logTo} }) } });
	new command({
		name: 'backupDir',
		exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'getBackupDir', logTo: message.logTo} }) },
		description: {
			grouping: 'Backups',
			summary: `Gets backup directory.`,
			console: `${sS.c['white'].c}Gets backup directory. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~backupDir${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Gets backup directory. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": 'Example: ',
				"color": sS.c['white'].m
			}, {
				"text": '~backupDir',
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Get Backup Directory",
					description: "~backupDir",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Gets backup directory."
					}, {
						name: "Example",
						value: "**~backupDir**"
					}]
				}
			}
		}
	}),
	new command({
		name: 'nextBackup',
		exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'nextBackup', logTo: message.logTo} }) },
		description: {
			grouping: 'Backups',
			summary: `Gets time to next backup.`,
			console: `${sS.c['white'].c}Gets time to next backup. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~nextBackup${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Gets time to next backup. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": 'Example: ',
				"color": sS.c['white'].m
			}, {
				"text": '~nextBackup',
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Next Backup",
					description: "~nextBackup",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Gets time to next backup."
					}, {
						name: "Example",
						value: "**~nextBackup**"
					}]
				}
			}
		}
	}),
	new command({
		name: 'lastBackup',
		exeFunc: function(message){ process.send({ function: 'unicast', module: 'backup', message: {function: 'lastBackup', logTo: message.logTo} }) },
		description: {
			grouping: 'Minecraft',
			summary: `Gets last backup info.`,
			console: `${sS.c['white'].c}Gets last backup info. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~lastBackup${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Gets last backup info. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
			}, {
				"text": `~lastBackup`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Last Backup",
					description: "~lastBackup",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Gets last backup info, time etc."
					}, {
						name: "Example",
						value: "**~lastBackup**"
					}]
				}
			}
		}
	});

	// nbt commands
	new command({
		name: 'getSpawn',
		exeFunc: function(message){ process.send({ function: 'unicast', module: 'nbt', message: {function: 'getSpawn', logTo: message.logTo} }) },
		description: {
			grouping: 'Minecraft',
			summary: `Gets server spawn coords.`,
			console: `${sS.c['white'].c}Gets server spawn coords. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~getSpawn${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Gets server spawn coords. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
			}, {
				"text": `~getSpawn`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Get Spawn Coords",
					description: "~getSpawn",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Gets server spawn coords."
					}, {
						name: "Example",
						value: "**~getSpawn**"
					}]
				}
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
			summary: `Gets given server property.`,
			console: `${sS.c['white'].c}Gets given server property. ${sS.c['brightWhite'].c}\nExample: ${sS.c['yellow'].c}~getProperty server-port${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Gets given server property.\n`,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
			}, {
				"text": `~getProperty server-port`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Get Server Property",
					description: "~getProperty",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Gets given server property from server.properties file."
					}, {
						name: "Example",
						value: "**~getProperty** server-port"
					}]
				}
			}
		}
	});
	new command({
		name: 'getProperties',
		exeFunc: function(message){ process.send({ function: 'unicast', module: 'properties', message: {function: 'getProperties', logTo: message.logTo} }) },
		description: {
			grouping: 'Minecraft',
			summary: `Gets server.properties file contents.`,
			console: `${sS.c['white'].c}Gets server.properties file contents. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~getProperties${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Gets server.properties file contents. `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `Example: `,
				"color": sS.c['white'].m
				}, {
				"text": `~getProperties`,
				"color": sS.c['yellow'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Get Server Properties",
					description: "~getProperties",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Gets server.properties file contents."
					}, {
						name: "Example",
						value: "**~getProperties**"
					}]
				}
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
			summary: `Teleports player to given chunk coords.`,
			console: `${sS.c['white'].c}Teleports player to given chunk coords. ${sS.c['reset'].c}\nExample: ${sS.c['yellow'].c}~tpc ${sS.c['orange'].c}10 ${sS.c['brightBlue'].c}10 ${sS.c['reset'].c}tp's to ${sS.c['orange'].c}160 ${sS.c['white'].c}100 ${sS.c['brightBlue'].c}160 ${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Teleports player to given chunk coords.\n`,
				"color": sS.c['brightWhite'].m
			}, {
				"text": 'Example: ',
				"color": sS.c['white'].m
			}, {
				"text": '~tpc ',
				"color": sS.c['brightYellow'].m
			}, {
				"text": '10 ',
				"color": sS.c['yellow'].m
			}, {
				"text": '10 ',
				"color": sS.c['brightBlue'].m
			}, {
				"text": "tp's to ",
				"color": sS.c['white'].m
			}, {
				"text": '160 ',
				"color": sS.c['yellow'].m
			}, {
				"text": '100 ',
				"color": sS.c['white'].m
			}, {
				"text": '160',
				"color": sS.c['brightBlue'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Teleport player to chunk coords",
					description: "~tpc",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Takes x and z coords given, multiplies them by 16 and teleports the player to that location."
					}, {
						name: "Example",
						value: "**~tpc** 10 10 teleports player to coords 160 100 160"
					}]
				}
			}
		}
	}),
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
			summary: `Teleports player to given region coords.`,
			console: `${sS.c['white'].c}Teleports player to given region coords. ${sS.c['reset'].c}\nExample: ${sS.c['yellow'].c}~tpr ${sS.c['orange'].c}10 ${sS.c['brightBlue'].c}10 ${sS.c['white'].c}tp's to ${sS.c['orange'].c}5120 ${sS.c['white'].c}100 ${sS.c['brightBlue'].c}5120 ${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Teleports player to given region coords.\n`,
				"color": sS.c['brightWhite'].m
			}, {
				"text": 'Example: ',
				"color": sS.c['white'].m
			}, {
				"text": '~tpr ',
				"color": sS.c['brightYellow'].m
			}, {
				"text": '10 ',
				"color": sS.c['yellow'].m
			}, {
				"text": '10 ',
				"color": sS.c['brightBlue'].m
			}, {
				"text": "tp's to ",
				"color": sS.c['white'].m
			}, {
				"text": '5120 ',
				"color": sS.c['yellow'].m
			}, {
				"text": '100 ',
				"color": sS.c['white'].m
			}, {
				"text": '5120',
				"color": sS.c['brightBlue'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Teleport player to region coords",
					description: "~tpr",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Takes x and z region coords, multiplies them by 512 and teleports the player to that location."
					}, {
						name: "Example",
						value: "**~tpr** 10 10 teleports player to coords 5,120 100 5,120"
					}]
				}
			}
		}
	}),
	new command({
		name: 'qm',
		exeFunc: function(message) {
			process.send({
				function: 'unicast',
				module: 'math',
				message: {
					function: 'qm',
					question: message.args.slice(1, message.args.length).join(' '),
					logTo: message.logTo
				}
			})
		},
		description: {
			grouping: 'Utility',
			summary: `Accepts any math question and/or unit conversion.`,
			console: `Accepts any math question and/or unit conversion. ${sS.c['white'].c}\nExamples:\n${sS.c['yellow'].c}~qm ${sS.c['cyan'].c}1 + 1\n${sS.c['yellow'].c}~qm ${sS.c['cyan'].c}1.2inch to cm\n${sS.c['yellow'].c}~qm ${sS.c['cyan'].c}1.2 * (2 + 4.5)\n${sS.c['yellow'].c}~qm ${sS.c['cyan'].c}sin(45 deg) ^ 2\n${sS.c['yellow'].c}~qm ${sS.c['cyan'].c}9 / 3 + 2i\n${sS.c['yellow'].c}~qm ${sS.c['cyan'].c}det([-1, 2; 3, 1])${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Accepts any math question and/or unit conversion.\n`,
				"color": sS.c['white'].m
			}, {
				"text": `Examples:\n`,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `~qm `,
				"color": sS.c['yellow'].m
			}, {
				"text": `1+1\n`,
				"color": sS.c['cyan'].m
			}, {
				"text": `~qm `,
				"color": sS.c['yellow'].m
			}, {
				"text": `1cm to inch\n`,
				"color": sS.c['cyan'].m
			}, {
				"text": `~qm `,
				"color": sS.c['yellow'].m
			}, {
				"text": `1.2 * (2 + 4.5)\n`,
				"color": sS.c['cyan'].m
			}, {
				"text": `~qm `,
				"color": sS.c['yellow'].m
			}, {
				"text": `sin(45 deg) ^ 2\n`,
				"color": sS.c['cyan'].m
			}, {
				"text": `~qm `,
				"color": sS.c['yellow'].m
			}, {
				"text": `9 / 3 + 2i\n`,
				"color": sS.c['cyan'].m
			}, {
				"text": `~qm `,
				"color": sS.c['yellow'].m
			}, {
				"text": `det([-1, 2; 3, 1])\n`,
				"color": sS.c['cyan'].m
			}],
			discord: {
				string: null,
				embed: {
					title: "Quick Math",
					description: "~qm",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Accepts any math question and/or unit conversion. For more info see https://mathjs.org/"
					}, {
						name: "Examples:",
						value: "**~qm** 1 + 1\n**~qm** 1.2inch to cm\n**~qm** 1.2 * (2 + 4.5)\n**~qm** sin(45 deg) ^ 2\n**~qm** 9 / 3 + 2i\n**~qm** det([-1, 2; 3, 1])"
					}]
				}
			}
		}
	})
}
