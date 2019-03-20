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
var serverSettings = importSettings();
serverSettings.serverStartVars.push("-Xms"+serverSettings.minRamAllocation, "-Xmx"+serverSettings.maxRamAllocation, "-jar", serverSettings.jar)
serverSettings.serverStartVars = serverSettings.serverStartVars.concat(serverSettings.serverPostfixVars);

/*
/ Init wrapper modules
*/
var liveModules = {};
reloadModules();
/*
/ Module management functions
*/
function reloadModules() {
	Object.keys(liveModules).forEach(function(moduleName) {
		liveModules[moduleName].process.kill('SIGHUP');
	})
	Object.keys(serverSettings.modules).forEach(function(moduleName) { // Iterate over enabled modules and initiate them
		var thisModule = serverSettings.modules[moduleName]
		if (thisModule.enabled) {
			liveModules[moduleName] = { process: null, functions: null };
			liveModules[moduleName].process = children.fork(serverSettings.modulesDir+thisModule.file); // Spawn the modules childprocess
			liveModules[moduleName].functions = require(serverSettings.modulesDir+thisModule.file); // Import the modules functions
			liveModules[moduleName].functions.init(liveModules[moduleName].process, serverSettings); // Run the modules init funciton
			
			liveModules[moduleName].process.on('message', message => { liveModules[moduleName].functions.wrapperFunctionHandle(message) })

			liveModules[moduleName].process.on('exit', code => { liveModules[moduleName].functions.processExit(code) }); // Handling for module exit
			liveModules[moduleName].process.on('uncaughtException', code => { liveModules[moduleName].functions.processError(code) }); // Handling for process exit
		}
	})
}

/*
/ Settings functions
*/
function importSettings() {
	return JSON.parse(fs.readFileSync('./serverSettings.json', 'utf8'));
}

function exportSettings() {
	fs.writeFile("./serverSettings.json", JSON.stringify(serverSettings, null, 2), 'utf8', function (err) {
		if (err) return err
		return true
	});
}

server = children.spawn('java', serverSettings.serverStartVars); // This will be assigned the server server when it starts
if (serverSettings.modules['stats'].enabled) { // If stats is enabled push a update
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
server.stdout.on('data', function (string) { // On server data out
	process.stdout.write(string); // Write line to wrapper console
	if (serverSettings.modules['discord'].enabled) {} // function to deal with discord control here
	if (string.indexOf("players online") > -1) { // "list" command has completed, server is now online
		consoleTimeout = false;
		if (serverSettings.modules['stats'].enabled) liveModules['stats'].process.send({ function: 'pushStats', serverStats: {status: "Running"} });  // If stats is enabled update the server status to enabled
	}
})

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
	//discordData += '[BOX] > '+string.toString().trim()+'\n'
	server.stdin.write(string.toString().trim()+'\n')
});

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
	process.stdout.write(`\n\u001b[41mDEBUG>\u001b[0m ${stringOut}\n`);
}