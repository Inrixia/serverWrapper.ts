// Import core packages
const moment = require("moment");
const fs = require("fs");
const util = require("./util.js");
const modul = require("./modul.js")

const thisModule = 'command';
const fn = {
	importCommands: async (commands) => {
		commands.forEach(async cmd => new command(cmd))
	}
}

// Set defaults
let sS = {} // serverSettings
let mS = {} // moduleSettings
let authErr = null;
let commands = {};
let commandGroupings = {};

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			[sS, mS] = modul.init(message, thisModule)
			fn.importCommands(message.commands);
			break;
		case 'kill':
			modul.kill(message);
			break;
		case 'pushSettings':
			[sS, mS] = modul.pushSettings(message, thisModule)
			break;
		case 'promiseResolve':
			modul.promiseResolve(message);
			break;
		case 'promiseReject':
			modul.promiseReject(message);
			break;
		case 'execute':
			fn[message.func](message.data)
			.then(data => modul.resolve(data, message.promiseId, message.returnModule))
			.catch(err => modul.reject(err, message.promiseId, message.returnModule))
			break;
		case 'discordMessage':
			processDiscordMessage(message.message).catch(err => util.lErr);
			break;
		case 'consoleStdout':
			processCommand(message).catch(err => util.lErr);
			break;
		case 'serverStdout':
			processServerMessage(message).catch(err => util.lErr);
			break;
	}
});

async function checkCommandAuth(allowedCommands, message) {
	for (command in allowedCommands) {
		if (!allowedCommands[command.toLowerCase()].expired && (allowedCommands[command.toLowerCase()].expiresAt === false || new Date(allowedCommands[command.toLowerCase()].expiresAt) > new Date())) { // If permission has not expired
			if (command == "*") return true;
			else if (command == "!*" && message.string.slice(0, 1) == "!") return true;
			else if (command == "~*" && message.string.slice(0, 1) == "~") return true;
			if (message.string.slice(0, command.length) == command) return true; // If the command beginning matches return true
		} else {
			if (allowedCommands[command.toLowerCase()].expired && (message.string.slice(0, command.length) == command)) throw new Error('Allowed use of this command has expired.');
			if (!allowedCommands[command.toLowerCase()].expired) {
				allowedCommands[command.toLowerCase()].expired = true;
				await util.saveSettings(null, 'command', sS)
			}
		}
	};
	if (!authErr) throw new Error('User not allowed to run this command.');
}


async function checkDiscordAuth(message) {
	if (mS.whitelisted_discord_users[message.author.id]) { // If user matches a whitelisted user
		let whitelisted_user = mS.whitelisted_discord_users[message.author.id];
		if (whitelisted_user['Username'] != message.author.username) {
			whitelisted_user['Username'] = message.author.username;
			util.saveSettings(null, 'command', sS)
		}
		if (await checkCommandAuth(whitelisted_user.allowedCommands, message)) return true;
	}
	for (role_index in message.member.roles) {
		discord_role = message.member.roles[role_index];
		if (discord_role.id in mS.whitelisted_discord_roles) { // If user has a whitelisted role
			let whitelisted_role = mS.whitelisted_discord_roles[discord_role.id];
			if (whitelisted_role['Name'] != discord_role.name) {
				whitelisted_role['Name'] = discord_role.name;
				util.saveSettings(null, 'command', sS)
			}
			if (await checkCommandAuth(whitelisted_role.allowedCommands, message)) return true;
		};
	}
	if (!authErr) throw new Error('User not whitelisted.');
}

async function processDiscordMessage(message) {
	// "Mod" role id: 344286675691896832
	// "Admin" role id: 278046497789181954
	if ((message.string[0] == '~' || message.string[0] == '!' || message.string[0] == '?') && await checkDiscordAuth(message)) { // User is allowed to run this command
		process.stdout.write(`[${sS.c['brightCyan'].c}${message.author.username}${sS.c['reset'].c}]: ${message.string.trim()}\n`);
		if (message.string[0] == '~' || message.string[0] == '?') await processCommand(message) // Message is a wrapperCommand or helpCommand
		else if (message.string[0] == '!') await modul.pSend(process, { function: 'serverStdin', string: message.string.slice(1,message.length).trim()+'\n' }) // Message is a serverCommand
	}
}

async function processServerMessage(message) {
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
	let ops = JSON.parse(await util.pReadFile('./ops.json', null))
	if (await util.getObj(ops, 'name', user)) await processCommand({ string: commandString, minecraft: true, user: user })
}

async function processCommand(message) {
	let executionStartTime = new Date();
	message.string = message.string.replace(/\s\s+/g, ' '); // Compact multiple spaces/tabs down to one
	message.logTo = {
		console: true,
		discord: (message.author) ? { channel: message.channel.id } : null,
		minecraft: message.minecraft,
		user: message.user
	};
	message.args = await getCommandArgs(message.string);
	let commandName = null;
	Object.keys(commands).forEach(cmd => {
		if (commandMatch(message.string.slice(1, message.string.length), cmd)) {
			commandName = cmd;
		}
	});
	if (commandName == null) throw new Error('Command not found.');
	let result = await commands[commandName.toLowerCase()].execute(message).catch(err => console.log(err));
	console.log('CommandResult:', result)
}

async function getCommandArgs(string) {
	return string.split(" ")||string;
}

function commandMatch(string, commandString) {
	if (string.toLowerCase() == commandString.toLowerCase()) return true; // If its a identical match pass it
	commandString = commandString+' '; // Otherwise add a space to avoid continuous commands and check for dynamic commands
	if (string.toLowerCase().slice(0, commandString.length) == commandString.toLowerCase()) return true;
	return false;
}

class command {
	constructor(obj) {
		this.name = obj.name;
		this.module = obj.module
		this.description = obj.description;
		this.exeFunc = obj.exeFunc;
		commands[this.name.toLowerCase()] = this;
	}

	async execute(message) {
		if (message.string[0] == '~') return await modul.send(this.module, this.exeFunc, message, thisModule)
		else if (message.string[0] == '?') this.help(message)
	}

	async help(message) { // Outputs help info for a command
		util.log({
			logInfoArray: [{
				function: 'help',
				vars: this.description
			}],
			logTo: message.logTo
		})
	}

	async helpAll(message) { // Outputs list of enabled commands
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
			if (!groupSummary[commands[c].module]) groupSummary[commands[c].module] = {console: ``, minecraft: [], discord: ``};
			groupSummary[commands[c].module].console += `${sS.c['brightWhite'].c}~${commands[c].name}${sS.c['reset'].c} ${((commands[c].description||{}).summary)||'Missing command summary!'}\n`;
			groupSummary[commands[c].module].minecraft.push({
				"text": `~${commands[c].name} `,
				"color": sS.c['brightWhite'].m
			}, {
				"text": `${((commands[c].description||{}).summary)||'Missing command summary!'}\n`,
				"color": sS.c['white'].m
			})
			groupSummary[commands[c].module].discord += `**~${commands[c].name}** ${((commands[c].description||{}).summary)||'Missing command summary!'}\n`
		});
		Object.keys(groupSummary).forEach(g => {
			helpSummary.console += `${sS.c[[g]].c}${g}${sS.c['reset'].c}\n${groupSummary[g].console}`;
			groupSummary[g].minecraft.push({
				"text": '\n\n'+g,
				"color": sS.c[sS.modules[commands[c].module].color].m
			})
			helpSummary.minecraft.concat(groupSummary[g].minecraft);
			helpSummary.discord.embed.fields.push({
				name: g,
				value: groupSummary[g].discord
			})
		});
		await modul.pSend(process, {
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
		return (async (message) => {
			message.function = this.name;
			return modul.pSend(process, message)
		})
	}
}

async function commandWhitelistAdd(message) {
	// ~commandwhitelist add !list @Inrix 1 hour
	// ~commandwhitelist remove !list @Inrix 1 hour
	if (message.mentions.users[0].id) {
		let whitelisted_object = mS.whitelisted_discord_users[message.mentions.users[0].id];
		whitelisted_object.Username = message.mentions.users[0].username;
	} else if (message.mentions.roles[0].id) {
		let whitelisted_object = mS.whitelisted_discord_roles[message.mentions.roles[0].id];
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
	await util.saveSettings(null, 'command', sS);
	return { wo: whitelisted_object, expiresin: expiresin };
}

async function commandWhitelistRemove(message) {
	if (message.args[0] == "~cw_removeall") {
		let whitelisted_object = mS.whitelisted_discord_users[message.mentions.users[0].id];
		if (message.mentions.users[0].id) delete mS.whitelisted_discord_users[message.mentions.users[0].id];
		else if (message.mentions.roles[0].id) delete mS.whitelisted_discord_roles[message.mentions.roles[0].id];
		await util.saveSettings(null, 'command', sS);
		return whitelisted_object
	} else {
		let whitelisted_object = mS.whitelisted_discord_users[message.mentions.users[0].id].allowedCommands[message.args[1].toLowerCase()];
		if (message.mentions.users[0].id) delete mS.whitelisted_discord_users[message.mentions.users[0].id].allowedCommands[message.args[1].toLowerCase()];
		else if (message.mentions.roles[0].id) delete mS.whitelisted_discord_roles[message.mentions.roles[0].id].allowedCommands[message.args[1].toLowerCase()];
		await util.saveSettings(null, 'command', sS);
		return whitelisted_object
	}
}


/*
/	Begin command definitions
*/

async function loadCommands() {
	commandGroupings = {
		'Wrapper Core': 'cyan',
		'Command': sS.modules['command'].color||'brightGreen',
		'Backups': sS.modules['backup'].color||'brightRed',
		'Minecraft': sS.modules['nbt'].color||'yellow',
		'Utility': sS.modules['math'].color||'brightMagenta'
	}
	new command({
		name: 'tpo', exeFunc: function(message){ modul.pSend(process, { function: 'unicast', module: 'nbt', message: {function: 'tpo', args: {username: message.args[1], x: message.args[2], y: message.args[3], z: message.args[4]}, logTo: message.logTo} }) },
		description: {
			grouping: 'Minecraft',
			summary: `Changes a players coordinates in playerdata.`,
			console: `${sS.c['brightWhite'].c}Set the coordinates of a given player in their playerdata to the coordinates specified. ${sS.c['reset'].c}\nExample: ${sS.c['yellow'].c}~tpo ${sS.c['brightBlue'].c}Username ${sS.c['orange'].c}0 ${sS.c['white'].c}100 ${sS.c['brightBlue'].c}0${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Teleports player to given chunk coords.\n`,
				"color": sS.c['brightWhite'].m
			}, {
				"text": 'Example: ',
				"color": sS.c['white'].m
			}, {
				"text": '~tpo ',
				"color": sS.c['brightYellow'].m
			}, {
				"text": 'Username ',
				"color": sS.c['brightBlue'].m
			}, {
				"text": '0 ',
				"color": sS.c['orange'].m
			}, {
				"text": '100 ',
				"color": sS.c['white'].m
			}, {
				"text": '0 ',
				"color": sS.c['brightBlue'].m
			}, {
				"text": "sets user coords to ",
				"color": sS.c['white'].m
			}, {
				"text": '160 ',
				"color": sS.c['orange'].m
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
					title: "Set a offline player's coords",
					description: "~tpo",
					color: parseInt(sS.c['orange'].h, 16),
					timestamp: new Date(),
					fields: [{
						name: "Description",
						value: "Takes Username, x, y and z coords given, and sets the player's playerdata coords to them."
					}, {
						name: "Example",
						value: "**~tpo** Username 10 0 10 set player's coords to 10 0 10"
					}]
				}
			}
		}
	});
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
	new command({
		name: 'cw_add', exeFunc: function(message){
			let executionStartTime = new Date();
			modul.pSend(process, {
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
			modul.pSend(process, {
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
			modul.pSend(process, {
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
			modul.pSend(process, {
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
		exeFunc: function(message){ modul.pSend(process, { function: 'unicast', module: 'backup', message: {function: 'startBackupInterval', logTo: message.logTo} }) },
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
			modul.pSend(process, { function: 'unicast', module: 'backup', message: {function: 'clearBackupInterval', logTo: message.logTo} })
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
			modul.pSend(process, {
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

	//new command({ name: 'backupdir_set', exeFunc: function(message){ modul.pSend(process, { function: 'unicast', module: 'backup', message: {function: 'setBackupDir', backupDir: message.args[1],save: message.args[2], logTo: message.logTo} }) } });
	new command({
		name: 'backupDir',
		exeFunc: function(message){ modul.pSend(process, { function: 'unicast', module: 'backup', message: {function: 'getBackupDir', logTo: message.logTo} }) },
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
		exeFunc: function(message){ modul.pSend(process, { function: 'unicast', module: 'backup', message: {function: 'nextBackup', logTo: message.logTo} }) },
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
		exeFunc: function(message){ modul.pSend(process, { function: 'unicast', module: 'backup', message: {function: 'lastBackup', logTo: message.logTo} }) },
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
		exeFunc: function(message){ modul.pSend(process, { function: 'unicast', module: 'nbt', message: {function: 'getSpawn', logTo: message.logTo} }) },
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
			modul.pSend(process, {
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
		exeFunc: function(message){ modul.pSend(process, { function: 'unicast', module: 'properties', message: {function: 'getProperties', logTo: message.logTo} }) },
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
			modul.pSend(process, {
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
			modul.pSend(process, {
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
	})
}
