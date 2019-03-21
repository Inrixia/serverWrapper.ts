// Set defaults
var serverSettings = {}

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			serverSettings = message.serverSettings;
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