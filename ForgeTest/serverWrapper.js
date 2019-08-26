// Spookelton Server Script - By Inrix \\

// Import core packages
const fs = require('fs')
const children = require('child_process');
const readline = require('readline');

process.stdin.setRawMode(true);

// Setup console handling
const consoleReadline = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: true,
	historySize: 10000,
	prompt: ''
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
let serverStartVars = Object.assign([], sS.serverStartVars);
serverStartVars.push("-Xms"+sS.minRamAllocation, "-Xmx"+sS.maxRamAllocation, "-jar", sS.jar)
serverStartVars = serverStartVars.concat(sS.serverPostfixVars);
sS.server_dir = __dirname;

if (((sS.modules['discord']||{}).settings||{}).discord_token == "" && fs.existsSync('./config/Chikachi/DiscordIntegration.json')) {
	sS.modules['discord'].settings.discord_token = fs.readFileSync('./config/Chikachi/DiscordIntegration.json', 'utf8').slice(31, 90);
}
if (((sS.modules['discord']||{}).settings||{}).discord_token == "") {
		sS.modules['discord'].enabled = false;
		process.stdout.write(`${sS.c['brightRed'].c}Disabled Module${sS.c['reset'].c}: ${sS.modules['discord'].color.c}discord.js${sS.c['reset'].c}, No Token Found!\n`);
}

const cleanExit = () => {
	server.process.kill();
	process.kill();
};
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch term

const util = require(sS.modulesDir+'util.js')

let fn = { // Object holding callable functions for modules
	'enableModule': async data => { 
		if (!loadedModules[data.args[1]]) throw new Error(`Module ${data.args[1]} is not loaded.`)
		return await loadedModules[data.args[1]].enable(data.args[2])
	},
	'disableModule': async data => { 
		if (!loadedModules[data.args[1]]) throw new Error(`Module ${data.args[1]} is not loaded.`)
		return await loadedModules[data.args[1]].disable(data.args[2])
	},
	'killModule': async data => { 
		if (!loadedModules[data.args[1]]) throw new Error(`Module ${data.args[1]} is not loaded.`)
		return await loadedModules[data.args[1]].kill()
	},
	'startModule': async data => { 
		if (!loadedModules[data.args[1]]) throw new Error(`Module ${data.args[1]} is not loaded.`)
		return await loadedModules[data.args[1]].start()
	},
	'restartModule':async data => { 
		if (!loadedModules[data.args[1]]) throw new Error(`Module ${data.args[1]} is not loaded.`)
		return await loadedModules[data.args[1]].restart()
	},
	'reloadModule': async data => { 
		if (!loadedModules[data.args[1]]) throw new Error(`Module ${data.args[1]} is not loaded.`)
		return await loadedModules[data.args[1]].reload()
	},
	'loadModuleFunctions': async data => { 
		if (!loadedModules[data.args[1]]) throw new Error(`Module ${data.args[1]} is not loaded.`)
		return await loadedModules[data.args[1]].loadFunctions() 
	},
	'restartModules': restartModules,
	'unloadModules': unloadModules,
	'reloadModules': reloadModules,
	'listModules': async data => {
		return loadedModules
	},
	'backupSettings': backupSettings,
	'loadSettings': loadSettings,
	'saveSettings': async data => {
		sS = data.sS;
		await wrapperModule.broadcast({function: 'pushSettings', sS: sS })
		return await saveSettings();
	}
}


/*
/ Module class definition
*/
class wrapperModule {
	constructor(moduleName) {
		this.name = moduleName;
		this.process = null;
		this.crashCount = 0;
		if (this.import) this.functions = require(sS.modulesDir+sS.modules[this.name].file);
		if (this.name == 'stats' && !this.enabled) process.stdout.write(`${String.fromCharCode(27)}]0;${sS.serverName}  |  Stats Module Disabled${String.fromCharCode(7)}`);
	}

	async start() {
		if (!this.functions && this.import) this.functions = require(sS.modulesDir+sS.modules[this.name].file);
		if (!this.process) {
			if (!loadedModules[this.name]) loadedModules[this.name] = this;
			this.process = children.fork(sS.modulesDir+sS.modules[this.name].file, [], { detached: false }); // Spawn the modules childprocess
			// Run the modules init funciton
			await pSend(this.process, {function: 'init', sS: sS, color: this.color, commands: this.name=='command'?commands:null }).catch(err => lErr(err, `Failed to send init for module ${this.name}!`))
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
				if (message.function == 'broadcast') {
					message.message.sourceModule = this.name;
					await wrapperModule.broadcast(message.message)
					.catch(err => lErr(err, `Failed to broadcast message "${JSON.stringify(message.message)}"\n`));
				} else if (message.function == 'unicast') {
					message.message.sourceModule = this.name;
					await wrapperModule.unicast(message.module, message.message)
					.catch(err => lErr(err, `Failed to unicast message "${JSON.stringify(message.message)} to module ${message.module}"\n`));
				} else if (message.function == 'serverStdin' && server) {
					console.log(message.string)
					server.stdin.write(message.string);
				} else if (message.function == 'execute') {
					fn[message.func](message.data).then(data => {
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
				}
			})
			return [{ event: 'moduleStarted', moduleName: this.name }]
		} else return [{ event: 'moduleAlreadyStarted', moduleName: this.name}]
	}

	static async resolve(data, promiseId, returnModule) {
		if (loadedModules[returnModule]||{}.process) return await pSend(loadedModules[returnModule].process, {
			function: 'promiseResolve',
			promiseID: promiseId,
			return: data
		})
		else throw new Error(`Cannot resolve promise ${promiseId} to ${returnModule} module not running.`)
	}
	static async reject(err, promiseId, returnModule) {
		if (loadedModules[returnModule]||{}.process) return await pSend(loadedModules[returnModule].process, {
			function: 'promiseReject',
			promiseID: promiseId,
			return: err
		})
		else throw new Error(`Cannot reject promise ${promiseId} to ${returnModule} module not running.`)
	}

	async restart() {
		return [].concat(await this.kill(), await this.start())
	}

	async reload() {
		return [].concat(await this.kill(), this.enabled?(await this.start()):[], this.import?(await this.loadFunctions()):[])
	}

	async loadFunctions() {
		if (this.import) this.functions = require(sS.modulesDir+sS.modules[this.name].file);
		return [{ event: 'moduleFunctionsLoaded', moduleName: this.name }]
	}

	async kill() {
		if (this.process) {
			const moduleDeath = [{ event: 'moduleKilled', moduleName: this.name, exitInfo: await pSend(this.process, { function: 'kill' }) }]
			if (this.name == 'stats') process.stdout.write(`${String.fromCharCode(27)}]0;${sS.serverName}  |  Stats Module Disabled${String.fromCharCode(7)}`);
			if ((sS.modules['command']||{}).enabled && this.name == 'command') {
				delete loadedModules['command'];
				loadedModules['command'] = new wrapperModule('command');
				return [].concat(moduleDeath, await loadedModules['command'].start());
			} else if ((sS.modules['log']||{}).enabled && this.name == 'log') {
				delete loadedModules['log'];
				loadedModules['log'] = new wrapperModule('log');
				return [].concat(moduleDeath, await loadedModules['log'].start());
			} else {
				this.process = null;
				return moduleDeath;
			}
			
		}
		else throw new Error(`Cannot kill ${this.name} as it is not running.`)
	}

	async enable(save) {
		sS.modules[this.name].enabled = true;
		if (save) await saveSettings();
		return [{ event: 'moduleEnabled', moduleName: this.name }]
	}

	async disable(save) {
		sS.modules[this.name].enabled = false;
		if (save) await saveSettings();
		return [{ event: 'moduleDisabled', moduleName: this.name }]
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
		.catch(err => lErr(err, `Failed to broadcast ${this.name} enabled: ${enable} update.`));
	}

	get description() { return sS.modules[this.name].description }
	set description(descriptionString) {
		sS.modules[this.name].description = descriptionString;
		wrapperModule.broadcast({function: 'pushSettings', sS: sS })
		.catch(err => lErr(err, `Failed to broadcast ${this.name} description: ${descriptionString} update.`));
	}

	get color() { return sS.c[sS.modules[this.name].color] };
	set color(moduleColor) {
		if (moduleColor in sS.c) {
			sS.modules[this.name].color = moduleColor;
			wrapperModule.broadcast({function: 'pushSettings', sS: sS })
			.catch(err => lErr(err, `Failed to broadcast ${this.name} color: ${moduleColor} update.`));
		} else throw new Error(`"${this.name}.color = ${moduleColor}" Invalid Colour.`);
	}
}

(async () => {
	backupSettings().catch(err => lErr(err, 'Failed to backup settings on launch.'));
	loadModules().then(startEnabledModules).then(startServer)
	.catch(err => lErr(err, 'Failed to start modules and launch server.'));
})();

/*
/ Module management functions
*/
async function loadModules() { // Loads in modules from server settings
	return [null].concat(Object.keys(sS.modules)).reduce(async (returnArray, moduleName) => {
		if (moduleName != undefined && !loadedModules[moduleName]) {
			loadedModules[moduleName] = new wrapperModule(moduleName);
			return [].concat(await returnArray, [{ event: 'moduleLoaded', moduleName: moduleName }])
		} else return returnArray;
	})
}

async function unloadModules() {
	return [null].concat(Object.keys(loadedModules)).reduce(async (returnArray, moduleName) => {
		const moduleDeath = loadedModules[moduleName].kill();
		delete loadedModules[moduleName];
		return [].concat(await returnArray, await moduleDeath)
	})
}

async function startEnabledModules() {
	return [null].concat(Object.keys(loadedModules)).reduce(async (returnArray, moduleName) => {
		if (loadedModules[moduleName].enabled && !loadedModules[moduleName].process) return [].concat(await returnArray, await loadedModules[moduleName].start())
	})
}

async function reloadModules() {
	return [].concat(await unloadModules(), await loadModules(), await startEnabledModules())
}

async function restartModules() {
	return [null].concat(Object.keys(loadedModules)).reduce(async (returnArray, moduleName) => {
		if (loadedModules[moduleName].enabled) return [].concat(await returnArray, await loadedModules[moduleName].restart())
	})
}

/*
/ Settings functions
*/
function loadSettings() {
	return new Promise((resolve, reject) => {
		fs.readFile(sSFile, 'utf8', (err, data) => {
			if (err) reject(err);
			sS = JSON.parse();
			wrapperModule.broadcast({function: 'pushSettings', sS: sS })
			.catch(err => lErr(err, 'Failed to broadcast new settings to modules.'))
			resolve();
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
	server = children.spawn('java', serverStartVars, { detached : false }); // This will be assigned the server server when it starts
	server.stdin.write('list\n'); // Write list to the console so we can know when the server has finished starting

	let postConsoleTimeout = (string) => { 
		process.stdout.write(string); // Write line to wrapper console
		wrapperModule.broadcast({ function: 'serverStdout', string: string.toString() }) 
		.catch(err => lErr(err, 'Failed to broadcast serverStdout.'));
	};
	let sStdoutHandler = (string) => {
		process.stdout.write(string); // Write line to wrapper console
		if (string.indexOf("players online") > -1) { // "list" command has completed, server is now online
			sStdoutHandler = postConsoleTimeout;
			started();
		}
	}
	let started = () => {
		if ((loadedModules['stats']||{}).process) { // If stats is enabled update the server status to enabled
			pSend(loadedModules['stats'].process, { function: 'pushStats', serverStats: {status: "Running"} })
			.catch(err => lErr(err, 'Failed to send server started status update.'));
		}
	}

	setTimeout(() => {
		sStdoutHandler = postConsoleTimeout;
		started();
	}, 120*1000) // Enable console broadcasting after 120 seconds if the check fails
	server.stdout.on('data', string => sStdoutHandler(string))

	if ((loadedModules['stats']||{}).process) { // If stats is enabled push a update
		pSend(loadedModules['stats'].process, {
			function: 'startStatsInterval',
			sS: sS,
			serverPID: server.pid,
			serverStats: {
				status: 'Starting...'
			}
		}).catch(err => lErr(err, 'Failed to send starting message to stats module.'));
	}

	// Server shutdown handling
	server.on('exit', (code) => {
		if ((loadedModules['stats']||{}).process) {
			pSend(loadedModules['stats'].process, { function: 'pushStats', serverStats: {status: "Closed"} })
			.catch(err => lErr(err, 'Failed to send server close message to stats module.'));  // If stats is enabled update the server status to enabled
		}
		console.log(`Server closed with exit code: ${code}\nKilling modules...`);
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
		wrapperModule.broadcast({function: 'consoleStdout', string: string.toString().trim() }).catch(err => lErr(err, 'Failed to broadcast consoleStdout.'));
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

/*
/ Private Util Functions
*/
async function lErr(err, name='') {
	console.log(`${sS.c['brightRed'].c}ERROR: ${sS.c['reset'].c}${name ? `${name}` : ''} ${err.message}\n${err.stack}`,)
}

function pSend(dstProcess, message) {
	return new Promise((resolve, reject) => {
		dstProcess.send(message, (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	})
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

const commands = [
	{
		name: 'restartModules', 
		exeFunc: 'restartModules',
		module: 'serverWrapper',
		description: {
			summary: `Restarts all modules`,
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
		module: 'serverWrapper',
		description: {
			summary: `Stops and unloads all modules.`,
			console: `${sS.c['brightWhite'].c}Stops and unloads all modules except command and log. ${sS.c['reset'].c}\nExample: ${sS.c['yellow'].c}~unloadModules${sS.c['reset'].c}`,
			minecraft: [{
				"text": `Stops and unloads all modules except command and log.\n`,
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
						value: "Stops and unloads all modules except command and log."
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
		module: 'serverWrapper',
		description: {
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
	}, {
		name: 'listModules', 
		exeFunc: 'listModules',
		module: 'serverWrapper',
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
	}, {
		name: 'enableModule', 
		exeFunc: 'enableModule',
		module: 'serverWrapper',
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
	}, {
		name: 'disableModule', 
		exeFunc: 'disableModule',
		module: 'serverWrapper',
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
	}, {
		name: 'reloadModule', 
		exeFunc: 'reloadModule',
		module: 'serverWrapper',
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
	}, {
		name: 'killModule', 
		exeFunc: 'killModule',
		module: 'serverWrapper',
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
	}, {
		name: 'startModule', 
		exeFunc: 'startModule',
		module: 'serverWrapper',
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
	}, {
		name: 'restartModule', 
		exeFunc: 'restartModule',
		module: 'serverWrapper',
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
	}, {
		name: 'loadModuleFunctions', 
		exeFunc: 'loadModuleFunctions',
		module: 'serverWrapper',
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
	}, {
		name: 'loadSettings', 
		exeFunc: 'loadSettings',
		module: 'serverWrapper',
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
	}, {
		name: 'backupSettings', 
		exeFunc: 'backupSettings',
		module: 'serverWrapper',
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
	}, {
		name: 'saveSettings', 
		exeFunc: 'saveSettings',
		module: 'serverWrapper',
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
	}
]