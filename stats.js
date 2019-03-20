// Import core packages
const pidusage = require('pidusage');


// Set defaults
var serverSettings = {}
var serverStats = { serverName: '', status: 'Init', pid: '', mem: '', cpu: '', uptime: '', timeToBackup: '' }; // Default stats
var statsInterval = null;

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			serverSettings = message.serverSettings;
			serverStats.serverName = serverSettings.serverName;
			if (!message.serverSettings.modules.backup.enabled) serverStats.timeToBackup = "Backups Disabled";
			sendStatsUpdate();
			break;
		case 'pushSettings':
			serverSettings = message.serverSettings;
			break;
		case 'fetchStats':
			process.send({function: '', serverStats: serverStats});
			break;
		case 'pushStats':
			serverStats.status = message.serverStats.status;
			sendStatsUpdate();
			break;
		case 'startStatsInterval':
			serverStats.pid = message.serverPID;
			serverStats.status = message.serverStats.status;
			sendStatsUpdate();
			startStatsInterval();
			break;
		case 'clearStatsInterval':
			clearInterval(statsInterval);
			break;
	}
});

function startStatsInterval() { // Start sending frequent stats updates
	statsInterval = setInterval(function(){sendStatsUpdate()}, serverSettings.statsPollrate)
}

function sendStatsUpdate() {
	if (serverStats.pid != '') getPidUsage();
	var updateString = `${String.fromCharCode(27)}]0;${serverStats.serverName} - ${serverStats.status}  |  PID: ${serverStats.pid}  |  Mem: ${Math.round(serverStats.mem/1024/1024)}MB  |  CPU: ${Math.round(serverStats.cpu/8)}%  |  Uptime: ${Math.round(serverStats.uptime/1000/60)} Min  |  Time To Next Backup: ${serverStats.timeToBackup}${String.fromCharCode(7)}`;
	process.send({function: 'wrapperStdout', string: updateString});
};

function getPidUsage() { // Get info for a running server from its PID
	pidusage(serverStats.pid, function (err, stats) {
		serverStats.cpu = stats.cpu;
		serverStats.mem = stats.memory;
		serverStats.uptime = stats.elapsed;
		// => {
		//   cpu: 10.0,            // percentage (from 0 to 100*vcore)
		//   memory: 357306368,    // bytes
		//   ppid: 312,            // PPID
		//   pid: 727,             // PID
		//   ctime: 867000,        // ms user + system time
		//   elapsed: 6650000,     // ms since the start of the process
		//   timestamp: 864000000  // ms since epoch
		// }
	})
}

module.exports.init = function init(thisModule, serverSettings) { // function called on serverWrapper.js for stats.js init
	thisModule.send({function: 'init', serverSettings: serverSettings});
}

module.exports.wrapperFunctionHandle = function wrapperFunctionHandle(message) { // function called on serverWrapper.js to handle commands from stats.js
	if (message.function == 'debug') process.stdout.write(`\n\u001b[41mDEBUG>\u001b[0m  ${message.string}\n`);
	if (message.function == 'wrapperStdout') process.stdout.write(message.string);
}

module.exports.processExit = function processExit(){}
module.exports.processError = function processError(){}
