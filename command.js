const thisModule = 'command';

// Import core packages
const moment = require("moment");
const util = require("./util/time.js")
const modul = new [require('./modul.js')][0](thisModule);

let commands = [];

const fn = {
	importCommands: async (commands) => commands.forEach(async cmd => new command(cmd)),
	init: async (data) => {
		[sS, mS] = modul.loadSettings(data)
		modul.event.on('consoleStdout', message => fn.processCommand({ string: message }).catch(err => modul.lErr(err)))
		modul.event.on('exportCommands', commands => fn.importCommands(commands))
		modul.event.on('fetchCommands', () => {
			modul.emit('exportCommands', [{
				name: 'debug',
				exeFunc: 'debug',
				module: thisModule,
				description: {
					console: `command used for debugging`,
					minecraft: [{
						"text": `command used for debugging`,
						"color": sS.c['brightWhite'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "command used for debugging",
							description: "~debug",
							color: parseInt(sS.c['white'].h, 16),
							timestamp: new Date()
						}
					}
				}
			}, {
				name: 'help',
				exeFunc: 'help',
				module: thisModule,
				description: {
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
			}, {
				name: 'fetchCommands',
				exeFunc: 'fetchCommands',
				module: thisModule,
				description: {
					console: `${sS.c['brightWhite'].c}Calls for all modules to give their commands. ${sS.c['reset'].c}\nExamples: ${sS.c['yellow'].c}~fetchCommands${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Calls for all modules to give their commands. `,
						"color": sS.c['brightWhite'].m
					}, {
						"text": `Examples: \n`,
						"color": sS.c['white'].m
					}, {
						"text": `~fetchCommands `,
						"color": sS.c['yellow'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Fetch Commands",
							description: "~help",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Calls for all modules to give their commands."
							}, {
								name: "Examples",
								value: "**~fetchCommands**"
							}]
						}
					}
				}
			}])
		})
		modul.emit('fetchCommands')
	},
	debug: async message => {
		delete message.member
		return {
			console: JSON.stringify(message, null, 2),
			minecraft: [{ "text": JSON.stringify(message, null, 2), "color": sS.c['brightWhite'].m }],
			discord: `\`\`\`json\n${JSON.stringify(message, null, 2)}\n\`\`\``
		}
	},
	help: async message => { // Outputs list of enabled commands
		if (message.args[1]) return commands[message.args[1].toLowerCase()].help(message);
		let	helpSummary = {
			console: ``,
			minecraft: [],
			discord: {
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
			let color = g=='serverWrapper'?sS.c['cyan']:sS.c[sS.modules[g].color]
			helpSummary.console += `${color.c}${g}${sS.c['reset'].c}\n${groupSummary[g].console}`;
			groupSummary[g].minecraft.push({
				"text": '\n\n'+g,
				"color": color.m
			})
			helpSummary.minecraft.concat(groupSummary[g].minecraft);
			helpSummary.discord.embed.fields.push({
				name: g,
				value: groupSummary[g].discord
			})
		});
		return helpSummary
	},
	fetchCommands: async data => {
		await modul.emit('fetchCommands');
	}
}

// Set defaults
let sS = {} // serverSettings
let mS = {} // moduleSettings
let authErr = null;

// Module command handling
process.on('message', async message => {
	switch (message.function) {
		case 'execute':
			if (!(message.func in fn)) modul.reject(new Error(`Command ${message.func} does not exist in module ${thisModule}`), message.promiseId, message.returnModule)
			else fn[message.func](message.data)
			.then(data => modul.resolve(data, message.promiseId, message.returnModule))
			.catch(err => modul.reject(err, message.promiseId, message.returnModule))
			break;
		case 'pushSettings':
			[sS, mS] = modul.loadSettings(message)
			break;
	}
});

fn.processCommand = async message => {
	message.string = message.string.replace(/\s\s+/g, ' '); // Compact multiple spaces/tabs down to one
	message.string = message.string.replace('\r', '')
	if (message.string[0] != '~' && message.string[0] != '?') return;
	message.logTo = {
		console: true,
		discord: (message.author) ? { channel: message.channel.id } : null,
		minecraft: message.minecraft,
		user: message.user
	};
	message.args = message.string.split('"').map(a => a.split(' ')).flatMap(a => a.indexOf('')!=-1?a.filter(v => v!=''):a);
	let commandName = null;
	let inputCommand = message.string.slice(1, message.string.length)
	Object.keys(commands).forEach(cmd => {
		if (commandMatch(inputCommand, cmd)) {
			commandName = cmd;
		}
	});
	if (commandName == null) return await modul.logg({
		console: `The command "${sS.c['brightRed'].c}${message.string}${sS.c['reset'].c}" could not be matched to a known command...`,
		minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
			[{
				"text": `The command "`,
				"color": "white"
			}, {
				"text": message.string,
				"color": sS.c['brightRed'].m
			}, {
				"text": `" could not be matched to a known command...`,
				"color": "white"
			}]
		)}\n`,
		discord : {
			embed: {
				color: parseInt(sS.c['red'].h, 16),
				title: `The command "${message.string}" could not be matched to a known command...`,
				description: null,
				timestamp: new Date()
			}
		}
	}, message.logTo);
	let exeStart = new Date();
	let commandOutput = await commands[commandName.toLowerCase()].execute(message).catch(err => {
		modul.lErr(err, `Error while executing command "${message.string}"`, message.logTo)
	});
	if (!commandOutput) return;
	if (!Array.isArray(commandOutput)) commandOutput = [commandOutput]
	commandOutput.forEach(async result => {
		if (result.discord && result.discord.embed) {
			let footerText = (((result.discord||{}).embed||{}).footer||{}).text
			let exeTime = `Executed in ${util.getDuration(exeStart, new Date())}`;
			if (footerText != undefined) result.discord.embed.footer.text = `${footerText} • ${exeTime}`
			else {
				result.discord = result.discord||{};
				embed = result.discord.embed||{};
				embed.footer = result.discord.embed.footer||{}
				embed.footer.text = exeTime
			}
		}
		await modul.logg(result, message.logTo).catch(err => modul.lErr(err, 'Command executed. Error while processing output.', message.logTo))
	})
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
		this.module = obj.module;
		this.description = obj.description;
		this.exeFunc = obj.exeFunc;
		commands[this.name.toLowerCase()] = this;
	}

	async execute(message) {
		if (message.string[0] == '~') return await modul.call(this.module, this.exeFunc, message)
		else if (message.string[0] == '?') return this.help(message)
	}

	help(message) { // Outputs help info for a command
		return {
			console: this.description.console,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(this.description.minecraft)}\n`,
			discord: this.description.discord
		};
	}

	static toWrapper() {
		return (async (message) => {
			message.function = this.name;
			return modul.pSend(process, message)
		})
	}
}