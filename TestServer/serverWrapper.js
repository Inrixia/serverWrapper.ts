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
var serverSettingsFile = './serverSettings.json'
var serverSettings = require(serverSettingsFile);
var loadedModules = {};
serverSettings.serverStartVars.push("-Xms"+serverSettings.minRamAllocation, "-Xmx"+serverSettings.maxRamAllocation, "-jar", serverSettings.jar)
var serverStartVars = serverSettings.serverStartVars.concat(serverSettings.serverPostfixVars);
serverSettings.server_dir = __dirname;
var consoleTimeout = true;

if (fs.existsSync('./config/Chikachi/DiscordIntegration.json') && serverSettings.modules['discord'].settings.discord_token == "") {
	serverSettings.modules['discord'].settings.discord_token = fs.readFileSync('./config/Chikachi/DiscordIntegration.json', 'utf8').slice(31, 90);
}
if (serverSettings.modules['discord'].settings.discord_token == "") {
		serverSettings.modules['discord'].enabled = false;
		process.stdout.write(`\u001b[31;1mDisabled Module\u001b[0m: ${serverSettings.modules['discord'].color}discord.js\u001b[0m, No Token Found!\n`);
}
/*
/ Module class definition
*/
class wrapperModule {
	constructor(moduleName) {
		this.name = moduleName;
		this.process = null;
		this.running = false;
		this.crashCount = 0;
		if (this.enabled) this.functions = require(serverSettings.modulesDir+serverSettings.modules[this.name].file);
		if (this.name == 'stats' && !this.enabled) process.stdout.write(`${String.fromCharCode(27)}]0;${serverSettings.serverName}  |  Stats Module Disabled${String.fromCharCode(7)}`);
	}

	start() {
		if (!this.functions) this.functions = require(serverSettings.modulesDir+serverSettings.modules[this.name].file);
		if (!this.process) {
			if (!loadedModules[this.name]) loadedModules[this.name] = this;
			this.process = children.fork(serverSettings.modulesDir+serverSettings.modules[this.name].file); // Spawn the modules childprocess
			this.process.send({function: 'init', serverSettings: serverSettings, server: server, color: this.color }) // Run the modules init funciton

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
							process.stdout.write(`\u001b[31mModule Crashed: ${thisModule.color}${thisModule.name}\u001b[0m Restarting!\n`);
							thisModule.start();
						} else {
							process.stdout.write(`\u001b[31mModule Crashed Repeatidly: ${thisModule.color}${thisModule.name}\u001b[0m Disabling!\n`);
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
					if (message.function == 'restartAllModules') restartAllModules();
					else if (message.function == 'unloadAllModules') unloadAllModules();
					else if (message.function == 'reloadModules') reloadModules();
					else if (message.function == 'listModules') listModules();
					else if (message.function == 'loadSettings') {
						serverSettings = loadSettings();
						wrapperModule.broadcast({function: 'pushSettings', serverSettings: serverSettings });
					} else if (message.function == 'saveSettings') {
						serverSettings = message.serverSettings;
						wrapperModule.broadcast({function: 'pushSettings', serverSettings: serverSettings });
						saveSettings();
					} else if (message.args && loadedModules[message.args[1]]) {
						if (message.function == 'enableModule') loadedModules[message.args[1]].enable(message.args[2]);
						else if (message.function == 'disableModule') loadedModules[message.args[1]].disable(message.args[2]);
						else if (message.function == 'killModule') loadedModules[message.args[1]].kill();
						else if (message.function == 'startModule') loadedModules[message.args[1]].start();
						else if (message.function == 'restartModule') loadedModules[message.args[1]].restart();
						else if (message.function == 'reloadModule') loadedModules[message.args[1]].reload();
						else if (message.function == 'loadModuleFunctions') loadedModules[message.args[1]].loadFunctions();
					}
				});
			}
			process.stdout.write(`\u001b[36;1mStarted Module\u001b[0m: ${this.color}${this.name}\u001b[0m\n`);
			this.running = true;
		}
	}

	restart() {
		this.kill();
		this.start();
	}

	reload() {
		this.kill();
		this.functions = require(serverSettings.modulesDir+serverSettings.modules[this.name].file);
		if (this.name == 'command') this.start();
	}

	loadFunctions() {
		this.functions = require(serverSettings.modulesDir+serverSettings.modules[this.name].file);
	}

	kill(){
		if (this.process) {
			this.process.send({function: 'kill'})
			this.running = false;
			if (this.name == 'stats') process.stdout.write(`${String.fromCharCode(27)}]0;${serverSettings.serverName}  |  Stats Module Disabled${String.fromCharCode(7)}`);
			this.process = null;
			process.stdout.write(`\u001b[36;1mKilled Module\u001b[0m: ${this.color}${this.name}\u001b[0m\n`);
		}
	}

	enable(save) {
		serverSettings.modules[this.name].enabled = true;
		if (save) saveSettings();
		process.stdout.write(`\u001b[36;1mEnabled Module\u001b[0m: ${this.color}${this.name}\u001b[0m\n`);
	}

	disable(save) {
		serverSettings.modules[this.name].enabled = false;
		if (save) saveSettings();
		process.stdout.write(`\u001b[36;1mDisabled Module\u001b[0m: ${this.color}${this.name}\u001b[0m\n`);
	}

	static broadcast(message) {
		Object.keys(loadedModules).forEach(function(moduleName) {
			if (loadedModules[moduleName] && loadedModules[moduleName].process) loadedModules[moduleName].process.send(message);
		})
	}

	get enabled() { return serverSettings.modules[this.name].enabled }
	set enabled(enable) { serverSettings.modules[this.name].enabled = enable; }

	get color() { return serverSettings.modules[this.name].color };
	set color(moduleColor) { serverSettings.modules[this.name].color = moduleColor }
}

backupSettings();
loadModules().then(startEnabledModules()).then(startServer());

/*
/ Module management functions
*/
function loadModules() { // Loads in modules from server settings
	return new Promise(function(resolve, reject) {
		Object.keys(serverSettings.modules).forEach(function(moduleName) {
			if (moduleName != undefined && !loadedModules[moduleName]) {
				loadedModules[moduleName] = new wrapperModule(moduleName);
			}
		})
		resolve();
	})
}

function unloadAllModules() {
	Object.keys(loadedModules).forEach(function(moduleName) {
		loadedModules[moduleName].kill();
	})
	loadedModules = {};
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
	unloadAllModules();
	loadModules();
}

function restartAllModules() {
	Object.keys(loadedModules).forEach(function(moduleName) {
		if (loadedModules[moduleName].enabled) loadedModules[moduleName].restart();
	})
}

function listModules() {
	var enabledModules = "";
	var disabledModules = "";
	var seperator = ", "
	Object.keys(loadedModules).forEach(function(moduleName){
		thisModule = loadedModules[moduleName];
		if (thisModule.enabled) enabledModules += `${thisModule.color}${moduleName} \u001b[0m[${thisModule.process ? "\u001b[32mR\u001b[0m" : "\u001b[31mS\u001b[0m"}]\u001b[0m | `
		else disabledModules += `${thisModule.color}${moduleName} \u001b[0m[${thisModule.process ? "\u001b[32mR\u001b[0m" : "\u001b[31mS\u001b[0m"}]\u001b[0m | `
	})
	if (enabledModules.length > 0) enabledModules = enabledModules.slice(0, enabledModules.length-seperator.length);
	if (disabledModules.length > 0) disabledModules = disabledModules.slice(0, disabledModules.length-seperator.length);
	process.stdout.write(`\n\u001b[36;1mEnabled wrapper modules\u001b[0m: ${enabledModules}\n`);
	process.stdout.write(`\u001b[36;1mDisabled wrapper modules\u001b[0m: ${disabledModules}\n\n`);
}

/*
/ Settings functions
*/
function loadSettings() {
	return JSON.parse(fs.readFileSync(serverSettingsFile, 'utf8'));
}

function saveSettings() {
	fs.writeFile(serverSettingsFile, JSON.stringify(serverSettings, null, 2), 'utf8', function (err) {
		if (err) debug(err)
		return true
	});
}

function backupSettings() {
	fs.writeFile(serverSettingsFile+'.backup', JSON.stringify(serverSettings, null, 2), 'utf8', function (err) {
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
			serverSettings: serverSettings,
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
		if (typeof stringOut === 'string') process.stdout.write(`\n\u001b[41mDEBUG>\u001b[0m ${stringOut}\n\n`)
		else {
			process.stdout.write(`\n\u001b[41mDEBUG>\u001b[0m`);
			console.log(stringOut);
		}
	} catch (e) {
		process.stdout.write(`\n\u001b[41mDEBUG>\u001b[0m ${stringOut}\n\n`);
	}
}
