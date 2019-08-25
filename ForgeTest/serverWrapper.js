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

let cleanExit = () => { 
	if (server.process) server.process.kill('SIGKILL');
	Object.keys(loadedModules).forEach(moduleName => {
		loadedModules[moduleName].kill();
	});
};
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch term

const util = require(sS.modulesDir+'util.js')

let fn = { // Object holding callable functions for modules
	'enableModule':  async data => await loadedModules[data.module].enable(data.args).catch(err => {throw Err}),
	'disableModule':  async data => await loadedModules[data.module].disable(data.args).catch(err => {throw Err}),
	'killModule':  async data => await loadedModules[data.module].kill(data.args).catch(err => {throw Err}),
	'startModule':  async data => await loadedModules[data.module].start(data.args).catch(err => {throw Err}),
	'restartModule': async data => await loadedModules[data.module].restart(data.args).catch(err => {throw Err}),
	'reloadModule':  async data => await loadedModules[data.module].reload(data.args).catch(err => {throw Err}),
	'loadModuleFunctions':  async data => await loadedModules[data.module].loadFunctions(data.args).catch(err => {throw Err}),
	'restartAllModules': restartAllModules,
	'unloadAllModules': unloadAllModules,
	'reloadModules': reloadModules,
	'listModules': listModules,
	'backupSettings': backupSettings,
	'loadSettings': loadSettings,
	'saveSettings': async data => {
		sS = data.sS;
		await wrapperModule.broadcast({function: 'pushSettings', sS: sS })
		.catch(err => lErr(err, `Failed to broadcast settings update.`));
		return await saveSettings().catch(err => {throw err});
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
			this.process = children.fork(sS.modulesDir+sS.modules[this.name].file); // Spawn the modules childprocess
			// Run the modules init funciton
			await pSend(this.process, {function: 'init', sS: sS, server: server, color: this.color }).catch(err => lErr(err, `Failed to send init for module ${this.name}!`))
			this.process.addListener('close', (data) => {
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
					await wrapperModule.broadcast(message.message)
					.catch(err => lErr(err, `Failed to broadcast message "${JSON.stringify(message.message)}"\n`));
				} else if (message.function == 'unicast') {
					await wrapperModule.unicast(message.module, message.message)
					.catch(err => lErr(err, `Failed to unicast message "${JSON.stringify(message.message)} to module ${message.module}"\n`));
				} else if (message.function == 'serverStdin' && server) {
					console.log(message.string)
					server.stdin.write(message.string);
				} else if (message.function == 'execute') {
					fn[message.func](message.data)
					.then(data => wrapperModule.resolve(data, message.promiseId, message.returnModule))
					.catch(err => wrapperModule.reject(err, message.promiseId, message.returnModule))
				}
			})
			return;
		}
		throw new Error(`Cannot start ${this.name} as its already running.`)
	}

	async resolve(data, promiseId, returnModule) {
		return pSend({
			function: 'unicast',
			module: returnModule,
			message: {
				function: 'promiseResolve',
				promiseID: promiseId,
				return: data
			}
		}).cath(err => lErr(err, `Failed to resolve promise ${promiseId}, to module ${returnModule}`));
	}

	async reject(data, promiseId, returnModule) {
		return pSend({
			function: 'unicast',
			module: returnModule,
			message: {
				function: 'promiseReject',
				promiseID: promiseId,
				return: data
			}
		}).cath(err => lErr(err, `Failed to reject promise ${promiseId}, to module ${returnModule}`));
	}

	async unicast(destinationModule, message) {
		if (loadedModules[message.module]) {
			if (loadedModules[message.module]||{}.process) {
				return await pSend(loadedModules[message.module].process, message.message).catch(err => {throw err})
			} else throw new Error(`Attempted unicast message to offline module ${message.module}!`)
		} else throw new Error(`Attempted unicast message to undefined module ${message.module}!`)
	}

	async restart() {
		await this.start().catch(err => {throw err})
		await this.kill().catch(err => {throw err})
		return;
	}

	async reload() {
		let logInfoArray = await this.kill().catch(err => {throw err});
		if (this.import) await this.loadFunctions().catch(err => {throw err});
		if (this.enabled) await this.start().catch(err => {throw err});
		return;
	}

	async loadFunctions() {
		if (this.import) this.functions = require(sS.modulesDir+sS.modules[this.name].file);
		return;
		// return [{
		// 	function: 'loadModuleFunctions',
		// 	vars: {
		// 		color: this.color,
		// 		name: this.name,
		// 		executionStartTime: executionStartTime,
		// 		executionEndTime: new Date()
		// 	}
		// }];
	}

	async kill(){
		if (this.process) {
			await pSend(this.process, {function: 'kill'})
			if (this.name == 'stats') process.stdout.write(`${String.fromCharCode(27)}]0;${sS.serverName}  |  Stats Module Disabled${String.fromCharCode(7)}`);
			this.process = null;
			return;
			// return [{
			// 	function: 'killModule',
			// 	vars: {
			// 		color: this.color,
			// 		name: this.name,
			// 		executionStartTime: executionStartTime,
			// 		executionEndTime: new Date()
			// 	}
			// }];
		}
		throw new Error(`Cannot kill ${this.name} as it is not running.`)
		// return [{
		// 	function: 'killModule_notRunning',
		// 	vars: {
		// 		color: this.color,
		// 		name: this.name,
		// 		executionStartTime: executionStartTime,
		// 		executionEndTime: new Date()
		// 	}
		// }];
	}

	async enable(save) {
		sS.modules[this.name].enabled = true;
		if (save) await saveSettings();
		return;
		// return [{
		// 	function: 'enableModule',
		// 	vars: {
		// 		color: this.color,
		// 		name: this.name,
		// 		executionStartTime: executionStartTime,
		// 		executionEndTime: new Date()
		// 	}
		// }];
	}

	async disable(save) {
		sS.modules[this.name].enabled = false;
		if (save) await saveSettings();
		return;
		// return [{
		// 	function: 'disableModule',
		// 	vars: {
		// 		color: this.color,
		// 		name: this.name,
		// 		executionStartTime: executionStartTime,
		// 		executionEndTime: new Date()
		// 	}
		// }];
	}

	static async broadcast(message) {
		Object.keys(loadedModules).forEach(moduleName => {
			if ((loadedModules[moduleName]||{}).process) pSend(loadedModules[moduleName].process, message).catch(err => lErr(err, `Failed to broadcast to ${moduleName}.`));
		})
	}

	static async log(logObj) {
		if ((loadedModules['log']||{}).process) {
			return await pSend(loadedModules['log'].process, {function: 'log', logObj: logObj})
			.catch(err => {throw err})
		}
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
		} else util.debug(`"${this.name}.color = ${moduleColor}" Invalid Colour.`);
	}
}

(async () => {
	backupSettings().catch(err => lErr(err, 'Failed to backup settings on launch.'));
	loadModules().then(startEnabledModules).then(startServer)
	.catch(err => lErr(err, 'Failed to load and start modules and launch server.'));
})();

/*
/ Module management functions
*/
function loadModules() { // Loads in modules from server settings
	return new Promise(function(resolve, reject) {
		Object.keys(sS.modules).forEach(function(moduleName) {
			if (moduleName != undefined && !loadedModules[moduleName]) {
				loadedModules[moduleName] = new wrapperModule(moduleName);
			}
		})
		resolve();
	})
}

function unloadAllModules() {
	let logInfoArray = [];
	logInfoArray = [].concat.apply(
		[],
		Object.keys(loadedModules).map(function(moduleName) {
  		return loadedModules[moduleName].kill();
		})
	);
	loadedModules = {};
	if ((sS.modules['command']||{}).enabled) {
		loadedModules['command'] = new wrapperModule('command');
		loadedModules['command'].start();
	}
	if ((sS.modules['log']||{}).enabled) {
		loadedModules['log'] = new wrapperModule('log');
		loadedModules['log'].start();
	}
	return logInfoArray;
}

function startEnabledModules() {
	return new Promise(function(resolve, reject) {
		Object.keys(loadedModules).forEach(function(moduleName) {
			if (loadedModules[moduleName].enabled) loadedModules[moduleName].start();
		})
		wrapperModule.log({logInfoArray: listModules(), logTo: { console: true } });
		resolve();
	})
}

function reloadModules() {
	let logInfoArray = unloadAllModules();
	loadModules().then(startEnabledModules());
	return logInfoArray;
}

function restartAllModules() {
	return [].concat.apply(
		[],
		Object.keys(loadedModules).map(moduleName => {
  			if (loadedModules[moduleName].enabled) return loadedModules[moduleName].restart()
		})
	);
}

function listModules() {
	return [{
		function: 'listModules',
		vars: {
			loadedModules: loadedModules,
			seperator: " | ",
			executionStartTime: new Date(),
			executionEndTime: new Date()
		}
	}];
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

function startServer() {
	server = children.spawn('java', serverStartVars, { detached : false }); // This will be assigned the server server when it starts
	server.stdin.write('list\n'); // Write list to the console so we can know when the server has finished starting

	let postConsoleTimeout = (string) => { 
		wrapperModule.broadcast({ function: 'serverStdout', string: string.toString() }) 
		.catch(err => lErr(err, 'Failed to broadcast serverStdout.'));
	};
	let sStdoutHandler = (string) => {
		process.stdout.write(string); // Write line to wrapper console
		if (string.indexOf("players online") > -1) { // "list" command has completed, server is now online
			sStdoutHandler = postConsoleTimeout;
			if ((loadedModules['stats']||{}).process) { // If stats is enabled update the server status to enabled
				pSend(loadedModules['stats'].process, { function: 'pushStats', serverStats: {status: "Running"} })
				.catch(err => lErr(err, 'Failed to send server started status update.'));
			}
		}
	}
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
	console.log(`${sS.c['brightRed'].c}ERROR: ${sS.c['reset'].c}${name ? `${name}` : ''}${err.message}\n${err.stack}`,)
}
async function pSend(dstProcess, message) {
	return new Promise((resolve, reject) => {
		dstProcess.send(message, (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	})
}
