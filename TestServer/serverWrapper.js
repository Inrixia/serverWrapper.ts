// Spookelton Server Script - By Inrix \\

// Import core packages
const fs = require('fs')
const stdin = process.openStdin();
const children = require('child_process');

// On exception log it and continue
/*process.on('uncaughtException', function (exception) {
   console.log(exception.toString());
});*/

// http://www.lihaoyi.com/post/BuildyourownCommandLinewithANSIescapecodes.html
// Colours Reference ^^

// Init
var server = null;
var sSFile = './serverSettings.json'
var sS = require(sSFile);
var loadedModules = {};
var serverStartVars = Object.assign([], sS.serverStartVars);
serverStartVars.push("-Xms"+sS.minRamAllocation, "-Xmx"+sS.maxRamAllocation, "-jar", sS.jar)
serverStartVars = serverStartVars.concat(sS.serverPostfixVars);
sS.server_dir = __dirname;
var consoleTimeout = true;

if (fs.existsSync('./config/Chikachi/DiscordIntegration.json') && sS.modules['discord'].settings.discord_token == "") {
	sS.modules['discord'].settings.discord_token = fs.readFileSync('./config/Chikachi/DiscordIntegration.json', 'utf8').slice(31, 90);
}
if (sS.modules['discord'].settings.discord_token == "") {
		sS.modules['discord'].enabled = false;
		process.stdout.write(`${sS.c['brightRed']}Disabled Module${sS.c['reset']}: ${sS.modules['discord'].color}discord.js${sS.c['reset']}, No Token Found!\n`);
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

	start() {
		if (!this.functions && this.import) this.functions = require(sS.modulesDir+sS.modules[this.name].file);
		if (!this.process) {
			if (!loadedModules[this.name]) loadedModules[this.name] = this;
			this.process = children.fork(sS.modulesDir+sS.modules[this.name].file); // Spawn the modules childprocess
			this.process.send({function: 'init', sS: sS, server: server, color: this.color }) // Run the modules init funciton

			this.process.addListener('close', function(data){
				Object.keys(loadedModules).forEach(function(moduleName) {
					thisModule = loadedModules[moduleName];
					if (thisModule.process && !thisModule.process.channel) {
						thisModule.crashCount += 1;
						delete thisModule.process;
						setTimeout(function(){
							thisModule.crashCount -= 1;
						}, 10000)
						if (thisModule.crashCount < 3) {
							process.stdout.write(`${sS.c['red']}Module Crashed: ${thisModule.color}${thisModule.name}${sS.c['reset']} Restarting!\n`);
							thisModule.start();
						} else {
							process.stdout.write(`${sS.c['red']}Module Crashed Repeatidly: ${thisModule.color}${thisModule.name}${sS.c['reset']} Disabling!\n`);
						}
					}
				})
			});

			this.process.on('message', message => {
				if (this.process)	{
					if (message.function == 'broadcast') wrapperModule.broadcast(message.message);
					if (message.function == 'unicast' && loadedModules[message.module] && loadedModules[message.module].process) loadedModules[message.module].process.send(message.message)
					if (message.function == 'serverStdin' && server) server.stdin.write(message.string);
				}
			})
			if (this.name == 'command') { // Command handling for wrapperHost specific functions that can only be run within serverWrapper
				this.process.on('message', message => {
					var logInfoArray = [];
					if (message.function == 'restartAllModules') logInfoArray = restartAllModules();
					else if (message.function == 'unloadAllModules') logInfoArray = unloadAllModules();
					else if (message.function == 'reloadModules') logInfoArray = reloadModules();
					else if (message.function == 'listModules') listModules();
					else if (message.args && loadedModules[message.args[1]]) {
						if (message.function == 'enableModule') logInfoArray = loadedModules[message.args[1]].enable(message.args[2]);
						else if (message.function == 'disableModule') logInfoArray = loadedModules[message.args[1]].disable(message.args[2]);
						else if (message.function == 'killModule') logInfoArray = loadedModules[message.args[1]].kill();
						else if (message.function == 'startModule') logInfoArray = loadedModules[message.args[1]].start();
						else if (message.function == 'restartModule') logInfoArray = loadedModules[message.args[1]].restart();
						else if (message.function == 'reloadModule') logInfoArray = loadedModules[message.args[1]].reload();
						else if (message.function == 'loadModuleFunctions') loadedModules[message.args[1]].loadFunctions();
					} else if (message.function == 'loadSettings') {
						sS = loadSettings();
						wrapperModule.broadcast({function: 'pushSettings', sS: sS });
					} else if (message.function == 'saveSettings') {
						sS = message.sS;
						wrapperModule.broadcast({function: 'pushSettings', sS: sS });
						saveSettings();
					}
					if (logInfoArray != [] && logInfoArray) wrapperModule.sendLog({logInfoArray: logInfoArray, logTo: (message.logTo) ? message.logTo : {console: true} })
				});
			}
			return [{
				function: 'start',
				vars: {
					color: this.color,
					name: this.name
				}
			}];
		}
		return [{
			function: 'start_alreadyRunning',
			vars: {
				color: this.color,
				name: this.name
			}
		}];
	}

	restart() {
		return (this.kill()).concat(this.start())
	}

	reload() {
		var logInfoArray = this.kill();
		if (this.import) logInfoArray.concat(this.loadFunctions());
		if (this.enabled) logInfoArray.concat(this.start());
		return logInfoArray;
	}

	loadFunctions() {
		if (this.import) this.functions = require(sS.modulesDir+sS.modules[this.name].file);
		return [{
			function: 'loadFunctions',
			vars: {
				color: this.color,
				name: this.name
			}
		}];
	}

	kill(){
		if (this.process) {
			this.process.send({function: 'kill'})
			if (this.name == 'stats') process.stdout.write(`${String.fromCharCode(27)}]0;${sS.serverName}  |  Stats Module Disabled${String.fromCharCode(7)}`);
			this.process = null;
			return [{
				function: 'kill',
				vars: {
					color: this.color,
					name: this.name
				}
			}];
		}
		return [{
			function: 'kill_notRunning',
			vars: {
				color: this.color,
				name: this.name
			}
		}];
	}

	enable(save) {
		sS.modules[this.name].enabled = true;
		if (save) saveSettings();
		return [{
			function: 'enable',
			vars: {
				color: this.color,
				name: this.name
			}
		}];
	}

	disable(save) {
		sS.modules[this.name].enabled = false;
		if (save) saveSettings();
		return [{
			function: 'disable',
			vars: {
				color: this.color,
				name: this.name
			}
		}];
	}

	static broadcast(message) {
		Object.keys(loadedModules).forEach(function(moduleName) {
			if (loadedModules[moduleName] && loadedModules[moduleName].process) loadedModules[moduleName].process.send(message);
		})
	}

	static sendLog(logObj) {
		if (loadedModules['log'] && loadedModules['log'].process) loadedModules['log'].process.send({function: 'log', logObj: logObj})
	}

	get enabled() { return sS.modules[this.name].enabled }
	set enabled(enable) { sS.modules[this.name].enabled = enable; }

	get color() { return sS.c[sS.modules[this.name].color] };
	set color(moduleColor) {
		if (moduleColor in sS.c) sS.modules[this.name].color = moduleColor;
		else debug(`"${this.name}.color = ${moduleColor}" Invalid Colour.`)	;
	}
}

backupSettings();
loadModules().then(startEnabledModules()).then(startServer());

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
	var logInfoArray = [];
	var logInfoArray = [].concat.apply(
		[],
		Object.keys(loadedModules).map(function(moduleName) {
  		return loadedModules[moduleName].kill();
		})
	);
	loadedModules = {};
	if (sS.modules['command'] && sS.modules['command'].enabled) {
		loadedModules['command'] = new wrapperModule('command');
		loadedModules['command'].start();
	}
	if (sS.modules['log'] && sS.modules['log'].enabled) {
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
		listModules();
		resolve();
	})
}

function reloadModules() {
	var logInfoArray = unloadAllModules();
	loadModules();
	return logInfoArray;
}

function restartAllModules() {
	return [].concat.apply(
		[],
		Object.keys(loadedModules).map(function(moduleName) {
  		if (loadedModules[moduleName].enabled) return loadedModules[moduleName].restart()
		})
	);
}

function listModules() {
	var enabledModules = "";
	var disabledModules = "";
	var seperator = ", "
	Object.keys(loadedModules).forEach(function(moduleName){
		thisModule = loadedModules[moduleName];
		if (thisModule.enabled) enabledModules += `${thisModule.color}${moduleName} ${sS.c['reset']}[${thisModule.process ? `${sS.c['green']}R${sS.c['reset']}` : `${sS.c['red']}S${sS.c['reset']}`}]${sS.c['reset']} | `
		else disabledModules += `${thisModule.color}${moduleName} ${sS.c['reset']}[${thisModule.process ? `${sS.c['green']}R${sS.c['reset']}` : `${sS.c['red']}S${sS.c['reset']}`}]${sS.c['reset']} | `
	})
	if (enabledModules.length > 0) enabledModules = enabledModules.slice(0, enabledModules.length-seperator.length);
	if (disabledModules.length > 0) disabledModules = disabledModules.slice(0, disabledModules.length-seperator.length);
	process.stdout.write(`\n${sS.c['brightCyan']}Enabled wrapper modules${sS.c['reset']}: ${enabledModules}\n`);
	process.stdout.write(`${sS.c['brightCyan']}Disabled wrapper modules${sS.c['reset']}: ${disabledModules}\n\n`);
}

/*
/ Settings functions
*/
function loadSettings() {
	return JSON.parse(fs.readFileSync(sSFile, 'utf8'));
}

function saveSettings() {
	fs.writeFile(sSFile, JSON.stringify(sS, null, 2), 'utf8', function (err) {
		if (err) debug(err)
		return true
	});
}

function backupSettings() {
	fs.writeFile(sSFile+'.backup', JSON.stringify(sS, null, 2), 'utf8', function (err) {
		if (err) debug(err)
		return true
	});
}

function startServer() {
	server = children.spawn('java', serverStartVars); // This will be assigned the server server when it starts
	server.stdin.write('list\n'); // Write list to the console so we can know when the server has finished starting

	server.stdout.on('data', function (string) { // On server data out
		if (!consoleTimeout) wrapperModule.broadcast({function: 'serverStdout', string: string.toString() });
		process.stdout.write(string); // Write line to wrapper console
		if (string.indexOf("players online") > -1) { // "list" command has completed, server is now online
			consoleTimeout = false;
			if (loadedModules['stats'] && loadedModules['stats'].process) loadedModules['stats'].process.send({ function: 'pushStats', serverStats: {status: "Running"} });  // If stats is enabled update the server status to enabled
		}
	})

	if (loadedModules['stats'] && loadedModules['stats'].process) { // If stats is enabled push a update
		loadedModules['stats'].process.send({
			function: 'startStatsInterval',
			sS: sS,
			serverPID: server.pid,
			serverStats: {
				status: 'Starting...'
			}
		});
	}

	// Server shutdown handling
	server.on('exit', function (code) {
		if (loadedModules['stats'] && loadedModules['stats'].process) loadedModules['stats'].process.send({ function: 'pushStats', serverStats: {status: "Closed"} });  // If stats is enabled update the server status to enabled
	    console.log(`Server closed with exit code: ${code}\nRestarting wrapper...`);
	    process.exit();
			//restartWrapper();
	});

	// Server error handling
	server.on('error', function (error) {
	    console.log(`Server encountered a error!\n${error}`);
	});


	/*
	/ Wrapper Console Handling
	*/
	stdin.addListener("data", function(string) {
		wrapperModule.broadcast({function: 'consoleStdout', string: string.toString().trim() })
		if (string.toString().trim()[0] != '~') server.stdin.write(string.toString().trim()+'\n')
	});
}

/*
/ Util Functions
*/

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

function debug(stringOut) {
	try {
		if (typeof stringOut === 'string') process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset']} ${stringOut}\n\n`)
		else {
			process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset']}`);
			console.log(stringOut);
		}
	} catch (e) {
		process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset']} ${stringOut}\n\n`);
	}
}
