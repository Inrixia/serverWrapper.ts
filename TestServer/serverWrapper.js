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
var liveModules = {};
serverSettings.serverStartVars.push("-Xms"+serverSettings.minRamAllocation, "-Xmx"+serverSettings.maxRamAllocation, "-jar", serverSettings.jar)
var serverStartVars = serverSettings.serverStartVars.concat(serverSettings.serverPostfixVars);

backupSettings();

reloadModules().then(startServer());

/*
/ Module management functions
*/
function reloadModules() {
	return new Promise((resolve, reject) => {
		Object.keys(liveModules).forEach(function(moduleName) {
			killModule(moduleName);
		})
		liveModules = {}; // Clear liveModules and loadSettings

		Object.keys(serverSettings.modules).forEach(function(moduleName) { // Iterate over enabled modules and initiate them
			if (moduleName != undefined) startModule(moduleName);
		})

		if (liveModules['command']) { // Command handling for wrapperHost specific functions that can only be run within serverWrapper
			liveModules['command'].process.on('message', message => { 
				if (message.function == 'reloadModules') reloadModules();
				if (message.function == 'listModules') listModules();
				if (message.function == 'enableModule') enableModule(message.args[1], message.args[2]).then(startModule(message.args[1]))
				if (message.function == 'disableModule') disableModule(message.args[1], message.args[2])
				if (message.function == 'reloadModule') disableModule(message.args[1], message.args[2]).then(enableModule(message.args[1], message.args[2])).then(startModule(message.args[1]))
			});
		}
		if (!serverSettings.modules['stats'].enabled) process.stdout.write(`${String.fromCharCode(27)}]0;${serverSettings.serverName}  |  Stats Module Disabled${String.fromCharCode(7)}`);
		listModules();
		resolve();
	});
}

function startModule(moduleName) {
	var thisModule = serverSettings.modules[moduleName]
	if (thisModule && thisModule.enabled) {
		liveModules[moduleName] = { process: null, functions: null };
		liveModules[moduleName].process = children.fork(serverSettings.modulesDir+thisModule.file); // Spawn the modules childprocess
		liveModules[moduleName].functions = require(serverSettings.modulesDir+thisModule.file); // Import the modules functions
		liveModules[moduleName].functions.init({thisProcess: liveModules[moduleName].process, serverSettings: serverSettings, server: server}); // Run the modules init funciton

		liveModules[moduleName].process.on('uncaughtException', message => { 
			delete liveModules[moduleName];
			startModule(moduleName);
		})

		liveModules[moduleName].process.on('message', message => {
			if (liveModules[moduleName]) {
				liveModules[moduleName].functions.wrapperFunctionHandle({
					message: message, 
					server: server, 
					liveModules: liveModules
				}) 
			}
		})
	}
}

function enableModule(moduleName, save) {
	return new Promise((resolve, reject) => {
		if (moduleName != undefined) serverSettings.modules[moduleName].enabled = true;
		if (save) saveSettings();
		resolve();
	});
}

function disableModule(moduleName, save) {
	return new Promise((resolve, reject) => {
		serverSettings.modules[moduleName].enabled = false;
		if (save) saveSettings();
		if (!liveModules[moduleName]) resolve();
		else {
			resolve()
		}
	});
}

function killModule(moduleName) {
	if (!liveModules[moduleName]) resolve()
	else {
		liveModules[moduleName].functions.kill({thisProcess: liveModules[moduleName].process, serverSettings: serverSettings});
		delete liveModules[moduleName];
		if (moduleName == 'stats') process.stdout.write(`${String.fromCharCode(27)}]0;${serverSettings.serverName}  |  Stats Module Disabled${String.fromCharCode(7)}`);
	}
}

function listModules() {
	var activeModules = "";
	var seperator = ", "
	Object.keys(serverSettings.modules).forEach(function(moduleName){ if (serverSettings.modules[moduleName].enabled) activeModules += `${serverSettings.modules[moduleName].color}${moduleName}\u001b[0m | ` })
	if (activeModules.length > 0) activeModules = activeModules.slice(0, activeModules.length-seperator.length);
	process.stdout.write(`\n\u001b[36;1mActive wrapper modules\u001b[0m: ${activeModules}\n\n`);
	// Discorwriteout here
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
		if (serverSettings.modules['discord'].enabled) {} // function to deal with discord control here
		if (string.indexOf("players online") > -1) { // "list" command has completed, server is now online
			consoleTimeout = false;
			if (liveModules['stats']) liveModules['stats'].process.send({ function: 'pushStats', serverStats: {status: "Running"} });  // If stats is enabled update the server status to enabled
		}
	})
	if (liveModules['stats']) { // If stats is enabled push a update
		liveModules['stats'].process.send({
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
		if (serverSettings.modules['stats'].enabled) liveModules['stats'].process.send({ function: 'pushStats', serverStats: {status: "Closed"} });  // If stats is enabled update the server status to enabled
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
		if (liveModules['command']) { // If stats is enabled push a update
			liveModules['command'].process.send({
				function: 'consoleInput',
				string: string.toString().trim()
			});
		}
		if (string.slice(0, 0) != '~') server.stdin.write(string.toString().trim()+'\n')
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
	process.stdout.write(`\n\u001b[41mDEBUG>\u001b[0m ${stringOut}\n\n`);
}