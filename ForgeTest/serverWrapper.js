// Spookelton Server Script - By Inrix \\
const thisModule = 'serverWrapper'

// Import core packages
const fs = require('fs')
const children = require('child_process');
const readline = require('readline');
const path = require('path');
class EventEmitter extends require('events') {
    emit(type, ...args) {
		super.emit(type, ...args)
		if (args[args.length-1] != true) wrapperModule.emit(type, args)
    }
}

process.stdin.setRawMode(true);
let moduleEvent = new EventEmitter();

moduleEvent.on('exportCommands', commands => {
	if (Array.isArray(commands[0])) commands = commands[0]
	commands.forEach(command => {
		if (completions.indexOf(`~${command.name}`) == -1) {
			completions.push(`~${command.name}`)
			completions.push(`?${command.name}`)
		}
	})
})
let minecraftCompletions = ['help', 'advancement', 'ban', 'ban-ip', 'banlist ips', 
'banlist players', 'clear', 'blockdata', 'clone', 'debug', 'defaultgamemode', 
'deop', 'difficulty', 'effect', 'enchant', 'entitydata', 'execute', 'fill', 
'gamemode', 'gamerule', 'give', 'kick', 'kill', 'list', 'me', 'op', 'pardon', 
'pardon-ip', 'playsound', 'reload', 'save-all', 'save-off', 'save-on', 'say', 
'scoreboard', 'scoreboard objectives', 'scoreboard players', 'scoreboard teams', 
'seed', 'setblock', 'setidletimeout', 'setworldspawn', 'spawnpoint', 
'spreadplayers', 'stats', 'stop', 'stopsound', 'summon', 'teleport', 'tp', 'tell', 
'tellraw', 'testfor', 'testforblock', 'testforblocks', 'time', 'time set', 'time add', 
'time query', 'title', 'toggledownfall', 'tp', 'trigger', 'weather', 'weather clear', 
'weather rain', 'weather thunder', 'whitelist', 'worldborder', 'worldborder set', 
'worldborder center', 'worldborder damage', 'worldborder warning', 'worldborder get', 
'worldborder add', 'xp']
let completions = [].concat(minecraftCompletions)
// Setup console handling
const consoleReadline = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: true,
	historySize: 10000,
	prompt: '',
	completer: (line) => {
		const hits = completions.filter((c) => c.toLowerCase().startsWith(line.toLowerCase()));
		return [hits.length ? hits : completions, line];
	}
});

// On exception log it and continue
/*process.on('uncaughtException', function (exception) {
   console.log(exception.toString());
});*/

// http://www.lihaoyi.com/post/BuildyourownCommandLinewithANSIescapecodes.html
// Colours Reference ^^

// Init
let server = null;
let sSFile = './serverSettings.json'
let sS = require(sSFile);
let loadedModules = {};
let serverStartVars = Object.assign([], [`-D${sS.serverName}`].concat(sS.serverStartVars));

serverStartVars.push("-Xms"+sS.minRamAllocation, "-Xmx"+sS.maxRamAllocation, "-jar", sS.jar)
serverStartVars = serverStartVars.concat(sS.serverPostfixVars);
sS.server_dir = __dirname;
sS.serverName = path.basename(process.cwd());

if (((sS.modules['discord']||{}).settings||{}).discord_token == "" && fs.existsSync('./config/Chikachi/DiscordIntegration.json')) {
	sS.modules['discord'].settings.discord_token = fs.readFileSync('./config/Chikachi/DiscordIntegration.json', 'utf8').slice(31, 90);
}
if (((sS.modules['discord']||{}).settings||{}).discord_token == "") {
		sS.modules['discord'].enabled = false;
		process.stdout.write(`${sS.c['brightRed'].c}Disabled Module${sS.c['reset'].c}: ${sS.modules['discord'].color.c}discord.js${sS.c['reset'].c}, No Token Found!\n`);
}

let triedSafeExit = false;
let termOut = `${sS.c['brightRed'].c}Caught Ctrl-C, Terminating Processes...${sS.c['reset'].c}`;
consoleReadline.on('SIGINT', () => {
	if (server && !triedSafeExit) {
		console.log(`${sS.c['brightRed'].c}Caught Ctrl-C, closing server gracefully... Ctrl-C again to terminate!${sS.c['reset'].c}`)
		server.stdin.write('stop\n');
	} else {
		console.log(termOut)
		cleanExit();
	}
	if (triedSafeExit) {
		console.log(termOut)
		cleanExit();
	}
	triedSafeExit = true;
})

consoleReadline.on('SIGTSTP', () => {
	console.log('Caught SIGTSTP, Dont use Ctrl-Z.');
});

const cleanExit = () => {
	if (server && server.process) server.process.kill();
	process.exit();
};
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch term

let fn = { // Object holding callable functions for modules
	emit: (...args) => {
		wrapperModule.emit(...args)
	},
	enableModule: async data => { 
		let thisModule = loadedModules[data.args[1]]
		if (!thisModule) throw new Error(`Module ${thisModule} is not loaded.`)
		await thisModule.enable(data.args[2])
		return {
			console: `${sS.c['brightCyan'].c}Enabled module${sS.c['reset'].c}: ${thisModule.color.c}${thisModule.name}${sS.c['reset'].c}`,
			minecraft: `tellraw ${data.logTo.user} ${JSON.stringify(
				[{
					"text": `Enabled module `,
					"color": sS.c['brightCyan'].m
				}, {
					"text": thisModule.name,
					"color": thisModule.color.m
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(thisModule.color.h, 16),
					title: `Enabled module: ${thisModule.name}`,
					description: null,
					timestamp: new Date()
				}
			}
		}
	},
	disableModule: async data => { 
		let thisModule = loadedModules[data.args[1]]
		if (!thisModule) throw new Error(`Module ${thisModule} is not loaded.`)
		await thisModule.disable(data.args[2])
		return {
			console: `${sS.c['brightCyan'].c}Disabled module${sS.c['reset'].c}: ${thisModule.color.c}${thisModule.name}${sS.c['reset'].c}`,
			minecraft: `tellraw ${data.logTo.user} ${JSON.stringify(
				[{
					"text": `Disabled module `,
					"color": sS.c['brightCyan'].m
				}, {
					"text": thisModule.name,
					"color": thisModule.color.m
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(thisModule.color.h, 16),
					title: `Disabled module: ${thisModule.name}`,
					description: null,
					timestamp: new Date()
				}
			}
		}
	},
	killModule: async data => { 
		let thisModule = loadedModules[data.args[1]]
		if (!thisModule) throw new Error(`Module ${thisModule} is not loaded.`)
		await thisModule.kill()
		return {
			console: `${sS.c['brightCyan'].c}Killed module${sS.c['reset'].c}: ${thisModule.color.c}${thisModule.name}${sS.c['reset'].c}`,
			minecraft: `tellraw ${data.logTo.user} ${JSON.stringify(
				[{
					"text": `Killed module `,
					"color": sS.c['brightCyan'].m
				}, {
					"text": thisModule.name,
					"color": thisModule.color.m
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(thisModule.color.h, 16),
					title: `Killed module: ${thisModule.name}`,
					description: null,
					timestamp: new Date()
				}
			}
		}
	},
	startModule: async data => { 
		let thisModule = loadedModules[data.args[1]]
		if (!thisModule) throw new Error(`Module ${thisModule} is not loaded.`)
		await thisModule.start()
		return {
			console: `${sS.c['brightCyan'].c}Started module${sS.c['reset'].c}: ${thisModule.color.c}${thisModule.name}${sS.c['reset'].c}`,
			minecraft: `tellraw ${data.logTo.user} ${JSON.stringify(
				[{
					"text": `Started module `,
					"color": sS.c['brightCyan'].m
				}, {
					"text": thisModule.name,
					"color": thisModule.color.m
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(thisModule.color.h, 16),
					title: `Started module: ${thisModule.name}`,
					description: null,
					timestamp: new Date()
				}
			}
		}
	},
	restartModule:async data => { 
		let thisModule = loadedModules[data.args[1]]
		if (!thisModule) throw new Error(`Module ${thisModule} is not loaded.`)
		await thisModule.restart()
		return {
			console: `${sS.c['brightCyan'].c}Restarted module${sS.c['reset'].c}: ${thisModule.color.c}${thisModule.name}${sS.c['reset'].c}`,
			minecraft: `tellraw ${data.logTo.user} ${JSON.stringify(
				[{
					"text": `Restarted module `,
					"color": sS.c['brightCyan'].m
				}, {
					"text": thisModule.name,
					"color": thisModule.color.m
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(thisModule.color.h, 16),
					title: `Restarted module: ${thisModule.name}`,
					description: null,
					timestamp: new Date()
				}
			}
		}
	},
	reloadModule: async data => { 
		let thisModule = loadedModules[data.args[1]]
		if (!thisModule) throw new Error(`Module ${thisModule} is not loaded.`)
		await thisModule.reload()
		return {
			console: `${sS.c['brightCyan'].c}Reloaded module${sS.c['reset'].c}: ${thisModule.color.c}${thisModule.name}${sS.c['reset'].c}`,
			minecraft: `tellraw ${data.logTo.user} ${JSON.stringify(
				[{
					"text": `Reloaded module `,
					"color": sS.c['brightCyan'].m
				}, {
					"text": thisModule.name,
					"color": thisModule.color.m
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(thisModule.color.h, 16),
					title: `Reloaded module: ${thisModule.name}`,
					description: null,
					timestamp: new Date()
				}
			}
		}
	},
	loadModuleFunctions: async data => { 
		let thisModule = loadedModules[data.args[1]]
		if (!thisModule) throw new Error(`Module ${thisModule.name} is not loaded.`)
		await thisModule.loadFunctions()
		return {
			console: `${sS.c['brightCyan'].c}Loaded${sS.c['reset'].c} ${thisModule.color.c}${thisModule.name}${sS.c['reset'].c}'s functions`,
			minecraft: `tellraw ${data.logTo.user} ${JSON.stringify(
				[{
					"text": `Loaded `,
					"color": sS.c['brightCyan'].m
				}, {
					"text": `${thisModule.name}'s'`,
					"color": thisModule.color.m
				}, {
					"text": ` functions`,
					"color": "white"
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(thisModule.color.h, 16),
					title: `Loaded ${thisModule.name}'s functions'`,
					description: null,
					timestamp: new Date()
				}
			}
		}
	},
	restartModules: async data => {
		await restartModules()
		return {
			console: `${sS.c['brightCyan'].c}Restarted all modules...${sS.c['reset'].c}`,
			minecraft: `tellraw ${data.logTo.user} ${JSON.stringify(
				[{
					"text": `Restarted all modules...`,
					"color": sS.c['brightCyan'].m
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c['brightCyan'].h, 16),
					title: `Restarted all modules...`,
					description: null,
					timestamp: new Date()
				}
			}
		}
	},
	unloadModules: async data => {
		await unloadModules()
		return {
			console: `${sS.c['brightCyan'].c}Unloaded all non persistent modules...${sS.c['reset'].c}`,
			minecraft: `tellraw ${data.logTo.user} ${JSON.stringify(
				[{
					"text": `Unloaded all non persistent modules...`,
					"color": sS.c['brightCyan'].m
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c['brightCyan'].h, 16),
					title: `Unloaded all non persistent modules...`,
					description: null,
					timestamp: new Date()
				}
			}
		}
	},
	reloadModules: async data => {
		await unloadModules()
		await loadModules()
		await startEnabledModules()
		return {
			console: `${sS.c['brightCyan'].c}Reloaded all modules...${sS.c['reset'].c}`,
			minecraft: `tellraw ${data.logTo.user} ${JSON.stringify(
				[{
					"text": `Reloaded all modules...`,
					"color": sS.c['brightCyan'].m
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c['brightCyan'].h, 16),
					title: `Reloaded all modules...`,
					description: null,
					timestamp: new Date()
				}
			}
		}
	},
	listModules: async message => {
		let seperator = " "
		let enabledModules = "";
		let disabledModules = "";
		let enabledModulesIng = [{"text":"Enabled: "}];
		let disabledModulesIng = [{"text":"Disabled: "}];
		let moduleList = Object.keys(loadedModules).map((moduleName, index) => {
			let thisModule = loadedModules[moduleName];
			let discordName = thisModule.name
			if (thisModule.enabled) {
				enabledModulesIng = enabledModulesIng.concat([{
					"text": `\n  ${moduleName} `,
					"color": sS.c[sS.modules[moduleName].color].m
				}, {
					"text": `[`,
					"color": "white"
				}, {
					"text": `${thisModule.process ? 'R' : 'S'}`,
					"color": thisModule.process ? sS.c['green'].m : sS.c['red'].m
				}, {
					"text": `]`,
					"color": "white"
				}, {
					"text": !(index < Object.keys(loadedModules).length-1) ? '\n' : ''
				}])
				enabledModules += `${thisModule.color.c}${moduleName} ${sS.c['reset'].c}[${thisModule.process ? `${sS.c['green'].c}R${sS.c['reset'].c}` : `${sS.c['red'].c}S${sS.c['reset'].c}`}]${sS.c['reset'].c}${!(index < Object.keys(loadedModules).length-1) ? '' : seperator }`
			} else {
				disabledModulesIng = disabledModulesIng.concat([{
					"text": `\n  ${moduleName} `,
					"color": thisModule.color.m
				}, {
					"text": `[`,
					"color": "white"
				}, {
					"text": `${thisModule.process ? 'R' : 'S'}`,
					"color": thisModule.process ? sS.c['green'].m : sS.c['red'].m
				}, {
					"text": `]`,
					"color": "white"
				}])
				disabledModules += `${thisModule.color.c}${moduleName} ${sS.c['reset'].c}[${thisModule.process ? `${sS.c['green'].c}R${sS.c['reset'].c}` : `${sS.c['red'].c}S${sS.c['reset'].c}`}]${sS.c['reset'].c}${!(index < Object.keys(loadedModules).length-1) ? '' : seperator }`
			}
			return {
				discord: {
					string: null,
					embed: {
						color: parseInt(sS.c[sS.modules[moduleName].discordColor||sS.modules[moduleName].color].h, 16),
						title: `${thisModule.name}`,
						description: `${thisModule.description}`,
						timestamp: new Date(),
						footer: {
							text: `${(thisModule.process) ? 'Running' : 'Stopped'} • ${(thisModule.enabled) ? 'Enabled' : 'Disabled'}`
						}
					}
				},
				minecraft: null,
				console: null
			};
		})
		return [{
			discord: null,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(enabledModulesIng.concat(disabledModulesIng))}\n`,
			console: `${sS.c['brightCyan'].c}Enabled wrapper modules${sS.c['reset'].c}: ${enabledModules}\n`+`${sS.c['brightCyan'].c}Disabled wrapper modules${sS.c['reset'].c}: ${disabledModules}`
		}].concat(moduleList)
	},
	backupSettings: async data => {
		await backupSettings()
		return {
			console: `${sS.c['brightCyan'].c}Backed up settings${sS.c['reset'].c}`,
			minecraft: `tellraw ${data.logTo.user} ${JSON.stringify(
				{
					"text": `Backed up settings`,
					"color": sS.c['brightCyan'].m
				}
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c['brightCyan'].h, 16),
					title: `Backed up settings...`,
					description: null,
					timestamp: new Date()
				}
			}
		}
	},
	loadSettings: async data => {
		await loadSettings()
		return {
			console: `${sS.c['brightCyan'].c}Loaded settings${sS.c['reset'].c}`,
			minecraft: `tellraw ${data.logTo.user} ${JSON.stringify(
				{
					"text": `Loaded settings`,
					"color": sS.c['brightCyan'].m
				}
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c['brightCyan'].h, 16),
					title: `Loaded settings...`,
					description: null,
					timestamp: new Date()
				}
			}
		}
	},
	saveSettings: async data => {
		sS = data.sS||sS;
		await wrapperModule.broadcast({function: 'pushSettings', sS: sS })
		await saveSettings();
		return {
			console: `${sS.c['brightCyan'].c}Saved settings${sS.c['reset'].c}`,
			minecraft: `tellraw ${data.logTo.user} ${JSON.stringify(
				{
					"text": `Saved settings`,
					"color": sS.c['brightCyan'].m
				}
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c['brightCyan'].h, 16),
					title: `Saved settings...`,
					description: null,
					timestamp: new Date()
				}
			}
		}
	},
	serverStdin: async string => {
		process.stdout.write(string)
		if (server) server.stdin.write(string);
		else throw new Error('Attempted to send input to server while not running.')
	}
}

/*
/ Private Util Functions
*/
async function lErr(err, name='') {
	console.log(`${sS.c['brightRed'].c}ERROR: ${sS.c['reset'].c}${name ? `${name}` : ''} ${err.message}\n${err.stack}`,)
}

if (!('toJSON' in Error.prototype))
Object.defineProperty(Error.prototype, 'toJSON', {
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

function pSend(dstProcess, message) {
	return new Promise((resolve, reject) => {
		dstProcess.send(message, (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	})
}

/*
/ Module class definition
*/
class wrapperModule {
	constructor(moduleName) {
		this.name = moduleName;
		this.process = null;
		this.subscribedEvents = [];
		this.crashCount = 0;
		this.crossModulePromises = {};
		if (this.import) this.functions = require(sS.modulesDir+sS.modules[this.name].file);
		if (this.name == 'stats' && !this.enabled) process.stdout.write(`${String.fromCharCode(27)}]0;${sS.serverName}  |  Stats Module Disabled${String.fromCharCode(7)}`);
	}

	async start() {
		if (!this.functions && this.import) this.functions = require(sS.modulesDir+sS.modules[this.name].file);
		if (!this.process) {
			if (!loadedModules[this.name]) loadedModules[this.name] = this;
			this.process = children.fork(sS.modulesDir+sS.modules[this.name].file, [], { detached: false }); // Spawn the modules childprocess
			// Run the modules init funciton
			//await pSend(this.process, {function: 'init', sS: sS, color: this.color, commands: this.name=='command'?commands:null }).catch(err => lErr(err, `Failed to send init for module ${this.name}!`))
			this.process.addListener('close', () => {
				Object.keys(loadedModules).forEach(async moduleName => {
					let thisModule = loadedModules[moduleName];
					if (thisModule.process && !thisModule.process.channel) {
						thisModule.crashCount += 1;
						delete thisModule.process;
						setTimeout(() => {
							thisModule.crashCount -= 1;
						}, 10000)
						if (thisModule.crashCount < 3) {
							process.stdout.write(`${sS.c['red'].c}Module Crashed: ${thisModule.color.c}${thisModule.name}${sS.c['reset'].c} Restarting!\n`);
							await thisModule.start();
						} else {
							process.stdout.write(`${sS.c['red'].c}Module Crashed Repeatidly: ${thisModule.color.c}${thisModule.name}${sS.c['reset'].c} Disabling!\n`);
						}
					}
				})
			});
			this.process.on('message', async message => {
				switch (message.function) {
					case 'event':
						// Module has sent event
						moduleEvent.emit(message.event, message.args, true) // Emit in wrapper event handler
						wrapperModule.emit(message.event, message.args, this.name) // Broadcast to other modules
						break;
					case 'unicast':
						message.message.sourceModule = this.name;
						await wrapperModule.unicast(message.module, message.message)
						.catch(err => lErr(err, `Failed to unicast message "${JSON.stringify(message.message)} to module ${message.module}"\n`));		
						break;
					case 'execute':
						if (!(message.func in fn)) wrapperModule.reject(new Error(`Command ${message.func} does not exist in serverWrapper.js`), message.promiseId, message.returnModule)
						else fn[message.func](message.data).then(data => {
							wrapperModule.resolve(data, message.promiseId, message.returnModule)
							.catch(err => {
								lErr(err, `Failed to resolve promise ${message.promiseId}, to module ${message.returnModule}`)
							});
						}).catch(error => {
							wrapperModule.reject(error, message.promiseId, message.returnModule)
							.catch(err => {
								lErr(error)
								lErr(err, `Failed to reject promise ${message.promiseId}, to module ${message.returnModule}`)
							})
						})
						break;
					case 'eventSub':
						if (this.subscribedEvents.indexOf(message.event) == -1) this.subscribedEvents.push(message.event);
						break;
					case 'broadcast':
						message.message.sourceModule = this.name;
						await wrapperModule.broadcast(message.message)
						.catch(err => lErr(err, `Failed to broadcast message "${JSON.stringify(message.message)}"\n`));
						break;	
					case 'promiseResolve':
						this.promiseResolve(message);
						break;
					case 'promiseReject':
						this.promiseReject(message);
						break;				
				}
			})
			let init = await this.call('init', { 'sS': sS }).catch(err => lErr(err, `Failed to call init for module ${this.name}!`));
			return init;
		} else throw new Error(`Module ${this.name} has already been started!`)
	}

	static emit(event, args, exclude=null) {
		Object.keys(loadedModules).forEach(modul => {
			if (modul != exclude && (loadedModules[modul]||{}.process) && loadedModules[modul].subscribedEvents.indexOf(event) > -1) {
				pSend(loadedModules[modul].process, {
					function: 'event', 
					event: event, 
					args: args 
				}).catch(err => lErr(err, `Failed to send event "${event}" to module ${modul}`))
			}
		})
	}

	call(func, data) {
		let externalPromiseId = Math.random();
		let externalPromise = {};
		let promise = new Promise((resolve, reject) => {
			externalPromise.resolve = resolve;
			externalPromise.reject = reject;
		});
		this.crossModulePromises[externalPromiseId] = externalPromise;
		pSend(this.process, {
			function: 'execute',
			func: func,
			returnModule: 'serverWrapper',
			promiseId: externalPromiseId,
			data: data
		})
		return promise;
	}

	promiseResolve(message) {
		if (this.crossModulePromises[message.promiseID] == undefined) console.log(`\u001b[91;1mERROR: \u001b[0mAttempting to resolve undefined promise with message`, message)
		else {
			this.crossModulePromises[message.promiseID].resolve(message.return);
			delete this.crossModulePromises[message.promiseID];
		}
	}
	promiseReject(message) {
		if (this.crossModulePromises[message.promiseID] == undefined) console.log(`\u001b[91;1mERROR: \u001b[0mAttempting to reject undefined promise with message`, message)
		else {
			this.crossModulePromises[message.promiseID].reject(message.return);
			delete this.crossModulePromises[message.promiseID];
		}
	}

	static async resolve(data, promiseId, returnModule) {
		if (loadedModules[returnModule]||{}.process) return await pSend(loadedModules[returnModule].process, {
			function: 'promiseResolve',
			promiseID: promiseId,
			return: data
		})
		else throw new Error(`Cannot resolve promise ${promiseId} to ${returnModule} module not running/loaded.`)
	}
	static async reject(err, promiseId, returnModule) {
		if (loadedModules[returnModule]||{}.process) return await pSend(loadedModules[returnModule].process, {
			function: 'promiseReject',
			promiseID: promiseId,
			return: err
		})
		else throw new Error(`Cannot reject promise ${promiseId} to ${returnModule} module not running/loaded.`)
	}

	async restart() {
		await this.kill()
		await this.start()
	}

	async reload() {
		await this.kill()
		if (this.enabled) await this.start()
		if (this.import) await this.loadFunctions()
	}
	async loadFunctions() {
		if (this.import) this.functions = require(sS.modulesDir+sS.modules[this.name].file);
	}

	async kill() {
		if (this.process) {
			await this.process.send({function: 'kill'})
			if (this.name == 'stats') process.stdout.write(`${String.fromCharCode(27)}]0;${sS.serverName}  |  Stats Module Disabled${String.fromCharCode(7)}`);
			if (this.persistent) {
				delete loadedModules['command'];
				loadedModules['command'] = new wrapperModule('command');
				await loadedModules['command'].start()
			} else this.process = null;
		}
		else throw new Error(`Cannot kill ${this.name} as it is not running.`)
	}

	async enable(save) {
		sS.modules[this.name].enabled = true;
		if (save) await saveSettings();
	}

	async disable(save) {
		sS.modules[this.name].enabled = false;
		if (save) await saveSettings();
	}

	static async broadcast(message) {
		return Promise.all(Object.keys(loadedModules).map(async moduleName => {
			if ((loadedModules[moduleName]||{}).process) return await pSend(loadedModules[moduleName].process, message);
		}))
	}

	static async unicast(destinationModule, message) {
		if (loadedModules[destinationModule]) {
			if (loadedModules[destinationModule]||{}.process) {
				return await pSend(loadedModules[destinationModule].process, message)
			} else throw new Error(`Attempted unicast message to offline module ${destinationModule}!`)
		} else throw new Error(`Attempted unicast message to undefined module ${destinationModule}!`)
	}

	get enabled() { return sS.modules[this.name].enabled }
	set enabled(enable) {
		sS.modules[this.name].enabled = enable;
		wrapperModule.broadcast({function: 'pushSettings', sS: sS })
		.catch(err => lErr(err, `Failed to broadcast setting change ${this.name} enabled: ${enable} update.`));
	}

	get description() { return sS.modules[this.name].description }
	set description(descriptionString) {
		sS.modules[this.name].description = descriptionString;
		wrapperModule.broadcast({function: 'pushSettings', sS: sS })
		.catch(err => lErr(err, `Failed to broadcast setting change ${this.name} description: ${descriptionString} update.`));
	}

	get color() { return sS.c[sS.modules[this.name].color] };
	set color(moduleColor) {
		if (moduleColor in sS.c) {
			sS.modules[this.name].color = moduleColor;
			wrapperModule.broadcast({function: 'pushSettings', sS: sS })
			.catch(err => lErr(err, `Failed to broadcast setting change ${this.name} color: ${moduleColor} update.`));
		} else throw new Error(`"${this.name}.color = ${moduleColor}" Invalid Colour.`);
	}

	get persistent() { sS.modules[this.name].persistent; }
	set persistent(persistence) { 
		sS.modules[this.name].persistent = persistence;
		wrapperModule.broadcast({function: 'pushSettings', sS: sS })
		.catch(err => lErr(err, `Failed to broadcast setting change ${this.name} persistent: ${persistence} update.`));
	}
}


/*
/ START
*/
(async () => {
	backupSettings().catch(err => lErr(err, 'Failed to backup settings on launch.'));
	await loadModules()
	await startEnabledModules()
	await startServer()
	moduleEvent.on('fetchCommands', () => moduleEvent.emit('exportCommands', commands))
	moduleEvent.emit('fetchCommands')
})().catch(err => lErr(err, 'Failed to start modules and launch server.'));
/*
/ START
*/


/*
/ Module management functions
*/
async function loadModules() { // Loads in modules from server settings
	return Object.keys(sS.modules).map(moduleName => {
		if (moduleName != undefined && !loadedModules[moduleName]) {
			loadedModules[moduleName] = new wrapperModule(moduleName);
		}
	})
}

async function unloadModules() {
	return Object.keys(loadedModules).map(moduleName => {
		if (!sS.modules[moduleName].persistent) {
			if (loadedModules[moduleName].process) loadedModules[moduleName].kill();
			delete loadedModules[moduleName];
		}
	})
}

async function startEnabledModules() {
	return await Promise.all(Object.keys(loadedModules).reduce((results, moduleName) => {
		if (loadedModules[moduleName].enabled && !loadedModules[moduleName].process) {
			const startTime = Date.now();
			const result = loadedModules[moduleName].start()
			results.push(result)
			result.then(data => console.log(`Started ${loadedModules[moduleName].color.c}${moduleName}${sS.c.reset.c} in ${Date.now()-startTime}ms`))
		}
		return results
	}, []))
}

async function restartModules() {
	Object.keys(loadedModules).forEach(moduleName => {
		if (loadedModules[moduleName].enabled) loadedModules[moduleName].restart()
	})
}

/*
/ Settings functions
*/
function loadSettings() {
	return new Promise((resolve, reject) => {
		fs.readFile(sSFile, 'utf8', (err, data) => {
			if (err) reject(err);
			sS = JSON.parse(data);
			wrapperModule.broadcast({function: 'pushSettings', sS: sS }).then(data => resolve(data))
		})
	})
}

function saveSettings() {
	return new Promise((resolve, reject) => {
		fs.writeFile(sSFile, JSON.stringify(sS, null, 2), 'utf8', (err) => {
			if (err) reject(err);
			else resolve();
		})
	})
}

function backupSettings() {
	return new Promise((resolve, reject) => {
		fs.writeFile(sSFile+'.backup', JSON.stringify(sS, null, 2), 'utf8', (err) => {
			if (err) reject(err);
			else resolve();
		})
	})
}

async function startServer() {
	const colorArr = [
		// "[" Must go first to avoid replacing color codes
		["[", new RegExp(`\\[`, 'g'), `${sS.c['brightBlack'].c}[${sS.c['reset'].c}`],
		["]", new RegExp(`\\]`, 'g'), `${sS.c['brightBlack'].c}]${sS.c['reset'].c}`],
		["Server thread", new RegExp("Server thread", 'g'), `${sS.c['brightGreen'].c}Server thread${sS.c['reset'].c}`],
		["INFO", new RegExp("INFO", 'g'), `${sS.c['cyan'].c}INFO${sS.c['reset'].c}`],
		["WARN", new RegExp("WARN", 'g'), `${sS.c['orange'].c}WARN${sS.c['reset'].c}`],
		["ERROR", new RegExp("ERROR", 'g'), `${sS.c['red'].c}ERROR${sS.c['reset'].c}`],
		["FATAL", new RegExp("FATAL", 'g'), `${sS.c['brightRed'].c}FATAL${sS.c['reset'].c}`],
		["FML", new RegExp("FML", 'g'), `${sS.c['brightMagenta'].c}FML${sS.c['reset'].c}`]
	]
	const colorArrLen = colorArr.length
	const serverStartTime = Date.now();

	console.log(`${sS.c['brightCyan'].c}Starting server... ${sS.c['reset'].c}${sS.lastStartTime?`Last start took: ${sS.c['brightCyan'].c}${sS.lastStartTime}${sS.c['reset'].c}ms`:''}${sS.c['reset'].c}`)
	server = children.spawn('java', serverStartVars, { detached : false });
	server.stderr.on('data', err => {lErr({message: err, stack:''}, 'Failed to start server.')});
	if ((loadedModules['stats']||{}).process) loadedModules['stats'].call('startStatsInterval', {
		stats: {
			serverPID: server.pid,
			status: 'Starting'
		}
	}).catch(err => lErr(err, 'Failed to send server starting message to stats module.'));
	server.stdin.write('list\n'); // Write list to the console so we can know when the server has finished starting'

	let color = string => {
		for (let i = 0; i < colorArrLen; i++) {
			if (string.indexOf(colorArr[i][0]) > -1) {
				string = string.replace(colorArr[i][1], colorArr[i][2]);
			}
		}
		process.stdout.write(string);
	}

	let postConsoleTimeout = (string) => { 
		color(string.toString()) // Write line to wrapper console
		moduleEvent.emit('serverStdout', string.toString())
	};
	let sStdoutHandler = (string) => {
		color(string.toString()) // Write line to wrapper console
		if (string.indexOf("players online") > -1) { // "list" command has completed, server is now online
			clearInterval(otherStart);
			sStdoutHandler = postConsoleTimeout;
			started();
		}
	}
	let started = () => {
		sS.lastStartTime = Date.now()-serverStartTime
		console.log(`Server started in ${sS.c['brightCyan'].c}${sS.lastStartTime}${sS.c['reset'].c}ms`)
		if ((loadedModules['stats']||{}).process) loadedModules['stats'].call('startStatsInterval', {
			stats: {
				pid: server.pid,
				status: 'Running'
			}
		}).catch(err => lErr(err, 'Failed to send server started status update.'));
		saveSettings();
	}

	let otherStart = setTimeout(() => {
		sStdoutHandler = postConsoleTimeout;
		started();
	}, 120*1000) // Enable console broadcasting after 120 seconds if the check fails
	server.stdout.on('data', string => sStdoutHandler(string))		

	// Server shutdown handling
	server.on('exit', code => {
		wrapperModule.emit('pushStats', { status: "Closed" })
		console.log(`Server ${sS.c['brightRed'].c}closed${sS.c['reset'].c} with exit code: ${sS.c['brightCyan'].c}${code}${sS.c['brightRed'].c}\nKilling modules...${sS.c['reset'].c}`);
		Object.keys(loadedModules).forEach(moduleName => {
			loadedModules[moduleName].kill();
		});
		console.log('Wrapper shutdown finished... Exiting');
	    process.exit();
		//restartWrapper();
	});

	// Server error handling
	server.on('error', (err) => lErr(err, `Server encountered a error.`));

	/*
	/ Wrapper Console Handling
	*/
	consoleReadline.on('line', string => {
		moduleEvent.emit('consoleStdout', string.toString().trim())
		if (string.toString().trim()[0] != '~' && string.toString().trim()[0] != '?') server.stdin.write(string.toString().trim()+'\n');
	});
}

function restartWrapper() {
	// Spawn a new process of the wrapper and pipe the output to the current cmd window
	const newProcess = children.spawn(`"${process.argv.shift()}"`, process.argv, {
	    cwd: process.cwd(),
	    detached : false,
	    stdio: "inherit",
	    shell: true
	});
	// Force the old process to only close after the new one has been created by putting it in a synchronous call
	if (!newProcess) process.exit();
}

const commands = [{
	name: 'restartModules', 
	exeFunc: 'restartModules',
	module: thisModule,
	description: {
		console: `${sS.c['brightWhite'].c}Restarts all modules. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~restartModules${sS.c['reset'].c}`,
		minecraft: [{
			"text": `Restarts all modules. `,
			"color": sS.c['brightWhite'].m
		}, {
			"text": `Example: `,
			"color": sS.c['white'].m
			}, {
			"text": `~restartModules`,
			"color": sS.c['yellow'].m
		}],
		discord: {
			string: null,
			embed: {
				title: "Restart All Modules",
				description: "~restartModules",
				color: parseInt(sS.c['orange'].h, 16),
				timestamp: new Date(),
				fields: [{
					name: "Description",
					value: "Restarts all modules."
				}, {
					name: "Example",
					value: "**~restartModules**"
				}]
			}
		}
	}
}, {
	name: 'unloadModules', 
	exeFunc: 'unloadModules',
	module: thisModule,
	description: {
		console: `${sS.c['brightWhite'].c}Stops and unloads all non-persistent modules. ${sS.c['reset'].c}\nExample: ${sS.c['yellow'].c}~unloadModules${sS.c['reset'].c}`,
		minecraft: [{
			"text": `Stops and unloads all non-persistent modules.\n`,
			"color": sS.c['brightWhite'].m
		}, {
			"text": `Example: `,
			"color": sS.c['white'].m
			}, {
			"text": `~unloadModules`,
			"color": sS.c['yellow'].m
		}],
		discord: {
			string: null,
			embed: {
				title: "Unload All Modules",
				description: "~unloadModules",
				color: parseInt(sS.c['orange'].h, 16),
				timestamp: new Date(),
				fields: [{
					name: "Description",
					value: "Stops and unloads all non-persistent modules."
				}, {
					name: "Example",
					value: "**~unloadModules**"
				}]
			}
		}
	}
}, {
	name: 'reloadModules', 
	exeFunc: 'reloadModules',
	module: thisModule,
	description: {
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
}, {
	name: 'listModules', 
	exeFunc: 'listModules',
	module: thisModule,
	description: {
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
}, {
	name: 'enableModule', 
	exeFunc: 'enableModule',
	module: thisModule,
	description: {
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
}, {
	name: 'disableModule', 
	exeFunc: 'disableModule',
	module: thisModule,
	description: {
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
}, {
	name: 'reloadModule', 
	exeFunc: 'reloadModule',
	module: thisModule,
	description: {
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
}, {
	name: 'killModule', 
	exeFunc: 'killModule',
	module: thisModule,
	description: {
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
}, {
	name: 'startModule', 
	exeFunc: 'startModule',
	module: thisModule,
	description: {
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
}, {
	name: 'restartModule', 
	exeFunc: 'restartModule',
	module: thisModule,
	description: {
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
}, {
	name: 'loadModuleFunctions', 
	exeFunc: 'loadModuleFunctions',
	module: thisModule,
	description: {
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
}, {
	name: 'loadSettings', 
	exeFunc: 'loadSettings',
	module: thisModule,
	description: {
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
}, {
	name: 'backupSettings', 
	exeFunc: 'backupSettings',
	module: thisModule,
	description: {
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
}, {
	name: 'saveSettings', 
	exeFunc: 'saveSettings',
	module: thisModule,
	description: {
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
}]