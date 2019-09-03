const thisModule = 'command';

// Import core packages
const moment = require("moment");
const util = require("./util/fs.js")
const modul = new [require('./modul.js')][0](thisModule);


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

// Module command handling
process.on('message', async message => {
	switch (message.function) {
		case 'init':
			[sS, mS] = modul.loadSettings(message)
			fn.importCommands(message.commands);
			modul.event.on('consoleStdout', message => processCommand({ string: message }).catch(err => modul.lErr))
			break;
		case 'execute':
			fn[message.func](message.data)
			.then(data => modul.resolve(data, message.promiseId, message.returnModule))
			.catch(err => modul.reject(err, message.promiseId, message.returnModule))
			break;
		case 'pushSettings':
			[sS, mS] = modul.loadSettings(message)
			break;
	}
});

async function processCommand(message) {
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
	let exeStart = new Date();
	let result = await commands[commandName.toLowerCase()].execute(message)
	.catch(err => {
		modul.lErr(err, `Error while executing command "${message.string}"`, message.logTo)
	});
	if ((((result||{}).discord||{}).embed||{}).footer == undefined) {
		(((result||{}).discord||{}).embed||{}).footer = {
			text: `Executed in ${util.getDuration(exeStart, new Date())}`
		}
	}
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
		if (message.string[0] == '~') return await modul.send(this.module, this.exeFunc, message)
		else if (message.string[0] == '?') this.help(message)
	}

	async help(message) { // Outputs help info for a command
		return await modul.logg({
			console: this.description.console,
			minecraft: `tellraw ${this.description.user} ${JSON.stringify(this.description.minecraft)}\n`,
			discord: this.description.discord
		}, message.logTo);
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
