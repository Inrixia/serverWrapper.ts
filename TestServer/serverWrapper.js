// Spookelton Server Script - By Inrix \\

// Import core packages
const fs = require('fs')
const stdin = process.openStdin();
const children = require('child_process');

// On exception log it and continue
/*process.on('uncaughtException', function (exception) {
   console.log(exception.toString());
});*/

// Init
var server = null;
var serverSettingsFile = './serverSettings.json'
var serverSettings = require(serverSettingsFile);
var loadedModules = {};
serverSettings.serverStartVars.push("-Xms"+serverSettings.minRamAllocation, "-Xmx"+serverSettings.maxRamAllocation, "-jar", serverSettings.jar)
var serverStartVars = serverSettings.serverStartVars.concat(serverSettings.serverPostfixVars);

/*
/ Module class definition
*/
class wrapperModule {
	constructor(moduleName) {
		this.name = moduleName;
		this.running = false;
		this.process = null;
		if (this.enabled) this.functions = require(serverSettings.modulesDir+serverSettings.modules[this.name].file);
	}

	start() {
		if (!this.functions) this.functions = require(serverSettings.modulesDir+serverSettings.modules[this.name].file);
		if (!this.running) {
			loadedModules[this.moduleName] = this;
			this.process = children.fork(serverSettings.modulesDir+serverSettings.modules[this.name].file); // Spawn the modules childprocess
			this.functions.init({thisProcess: this.process, serverSettings: serverSettings, server: server}); // Run the modules init funciton

			this.process.on('uncaughtException', message => { 
				this.start();
			})

			this.process.on('message', message => {
				if (this.process) {
					this.functions.wrapperFunctionHandle({
						message: message, 
						server: server,
						loadedModules: loadedModules
					}) 
				}
			})
			this.running = true;
			process.stdout.write(`\u001b[36;1mStarted Module\u001b[0m: ${this.color}${this.name}\u001b[0m\n`);
		}
	}

	restart() {
		this.kill();
		this.start();
	}

	reload() {
		this.kill();
		if (this.enabled) this.functions = require(serverSettings.modulesDir+serverSettings.modules[this.name].file);
	}

	loadFunctions() {
		this.functions = require(serverSettings.modulesDir+serverSettings.modules[this.name].file);
	}

	kill(){
		if (this.running) {
			this.functions.kill({thisProcess: this.process, serverSettings: serverSettings});
			delete loadedModules[this.name];
			if (this.name == 'stats') process.stdout.write(`${String.fromCharCode(27)}]0;${serverSettings.serverName}  |  Stats Module Disabled${String.fromCharCode(7)}`);
			this.running = false;
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
		if (loadedModules['command'] && loadedModules['command'].running) { // Command handling for wrapperHost specific functions that can only be run within serverWrapper
			loadedModules['command'].process.on('message', message => {
				if (message.function == 'restartAllModules') restartAllModules();
				if (message.function == 'unloadAllModules') unloadAllModules();
				if (message.function == 'reloadModules') reloadModules();
				if (message.function == 'listModules') listModules();
				if (message.function == 'enableModule') loadedModules[message.args[1]].enable(message.args[2])
				if (message.function == 'disableModule') loadedModules[message.args[1]].disable(message.args[2])
				if (message.function == 'killModule') loadedModules[message.args[1]].kill()
				if (message.function == 'startModule') loadedModules[message.args[1]].start()
				if (message.function == 'restartModule') loadedModules[message.args[1]].restart()
				if (message.function == 'reloadModule') loadedModules[message.args[1]].reload()
				if (message.function == 'loadModuleFunctions') loadedModules[message.args[1]].loadFunctions()
			});
		}
		if (!serverSettings.modules['stats'].running) process.stdout.write(`${String.fromCharCode(27)}]0;${serverSettings.serverName}  |  Stats Module Disabled${String.fromCharCode(7)}`);
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
		loadedModules[moduleName].restart();
	})
}

function listModules() {
	var activeModules = "";
	var seperator = ", "
	Object.keys(serverSettings.modules).forEach(function(moduleName){ if (loadedModules[moduleName].enabled) activeModules += `${serverSettings.modules[moduleName].color}${moduleName}\u001b[0m | ` })
	if (activeModules.length > 0) activeModules = activeModules.slice(0, activeModules.length-seperator.length);
	process.stdout.write(`\n\u001b[36;1mActive wrapper modules\u001b[0m: ${activeModules}\n\n`);
}

/*
/ Settings functions
*/
function loadSettings() {
	return JSON.parse(fs.readFileSync(serverSettingsFile, 'utf8'));
}

function saveSettings() {
	fs.writeFile(serverSettingsFile, JSON.stringify(serverSettings, null, 2), 'utf8', function (err) {
		if (err) return err
		return true
	});
}

function backupSettings() {
	fs.writeFile(serverSettingsFile+'.backup', JSON.stringify(serverSettings, null, 2), 'utf8', function (err) {
		if (err) return err
		return true
	});
}

function startServer() {
	server = children.spawn('java', serverStartVars); // This will be assigned the server server when it starts
	server.stdout.on('data', function (string) { // On server data out
		process.stdout.write(string); // Write line to wrapper console
		if (loadedModules['stats'] && loadedModules['stats'].running) {} // function to deal with discord control here
		if (string.indexOf("players online") > -1) { // "list" command has completed, server is now online
			consoleTimeout = false;
			if (loadedModules['stats'] && loadedModules['stats'].running) loadedModules['stats'].process.send({ function: 'pushStats', serverStats: {status: "Running"} });  // If stats is enabled update the server status to enabled
		}
	})
	if (loadedModules['stats'] && loadedModules['stats'].running) { // If stats is enabled push a update
		loadedModules['stats'].process.send({
			function: 'startStatsInterval', 
			serverSettings: serverSettings, 
			serverPID: server.pid,
			serverStats: { 
				status: 'Starting...'
			}
		});
	}
	server.stdin.write('list\n') // Write list to the console so we can know when the server has finished starting

	// Server shutdown handling
	server.on('exit', function (code) {
		if (serverSettings.modules['stats'].running) loadedModules['stats'].process.send({ function: 'pushStats', serverStats: {status: "Closed"} });  // If stats is enabled update the server status to enabled
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
		if (loadedModules['command'] && loadedModules['command'].running) { // If stats is enabled push a update
			loadedModules['command'].process.send({
				function: 'consoleInput',
				string: string.toString().trim()
			});
		}
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
		JSON.stringify(stringOut);
		console.log(stringOut);
	} catch (e) {
		process.stdout.write(`\n\u001b[41mDEBUG>\u001b[0m ${stringOut}\n\n`);
	}
}