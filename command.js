// Set defaults
var serverSettings = {}

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			serverSettings = message.serverSettings;
			break;
		case 'consoleInput':
			processCommand(message.string);
			break;
		case 'kill':
			process.exit();
			break;
	}
});

module.exports.init = function init(objx) { // function called on serverWrapper.js for stats.js init
	objx.thisProcess.send({function: 'init', serverSettings: objx.serverSettings});
}

module.exports.kill = function kill(objx) {
	objx.thisProcess.send({function: 'kill'})
}

module.exports.wrapperFunctionHandle = function wrapperFunctionHandle(objx) { // function called on serverWrapper.js to handle commands from stats.js
	if (objx.message.function == 'debug') process.stdout.write(`\n\u001b[41mDEBUG>\u001b[0m  ${objx.message.string}\n`);
	if (objx.message.function == 'wrapperStdout') process.stdout.write(objx.message.string);
	if (objx.message.function == 'serverStdout') objx.server.stdin.write(objx.message.string);
}

function debug(string) {
	process.send({function: 'wrapperStdout', string: `\n\u001b[41mDEBUG>\u001b[0m  ${string}\n`});
}

function processCommand(string) {
	if (commandMatch(string, '~restartAllModules')) process.send({function: 'restartAllModules'});
	else if (commandMatch(string, '~unloadAllModules')) process.send({function: 'unloadAllModules'});
	else if (commandMatch(string, '~reloadModules')) process.send({function: 'reloadModules'});
	else if (commandMatch(string, '~reloadModules')) process.send({function: 'reloadModules'});
	else if (commandMatch(string, '~listModules')) process.send({function: 'listModules'});
	else if (commandMatch(string, '~enableModule')) process.send({ function: 'enableModule', args: getCommandArgs(string) })
	else if (commandMatch(string, '~disableModule') && getCommandArgs(string)[1] != 'command') process.send({ function: 'disableModule', args: getCommandArgs(string) })
	else if (commandMatch(string, '~reloadModule')) process.send({ function: 'reloadModule', args: getCommandArgs(string) })
	else if (commandMatch(string, '~killModule')) process.send({function: 'killModule', args: getCommandArgs(string) });
	else if (commandMatch(string, '~startModule')) process.send({function: 'startModule', args: getCommandArgs(string) });
	else if (commandMatch(string, '~restartModule')) process.send({function: 'restartModule', args: getCommandArgs(string) });
	else if (commandMatch(string, '~loadModuleFunctions')) process.send({function: 'loadModuleFunctions', args: getCommandArgs(string) });
}

function getCommandArgs(string) {
	return string.split(" ");
}

function commandMatch(string, command) {
	var commandLength = command.length;
	if (string.toLowerCase().slice(0, commandLength) == command.toLowerCase()) return true;
}