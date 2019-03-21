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
			if (message.serverpid != null) {
				serverStats.pid = message.serverpid;
				serverStats.status = "Running"
				startStatsInterval();
			}
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
		case 'kill':
			process.exit();
			break;
	}
});

module.exports.kill = function kill(objx) {
	objx.thisProcess.send({function: 'kill', serverSettings: objx.serverSettings})
}

module.exports.init = function init(objx) { // function called on serverWrapper.js for stats.js init
	var serverpid = null;
	if (objx.server) serverpid = objx.server.pid;
	objx.thisProcess.send({function: 'init', serverSettings: objx.serverSettings, serverpid: serverpid});
}

module.exports.wrapperFunctionHandle = function wrapperFunctionHandle(objx) { // function called on serverWrapper.js to handle commands from stats.js
	if (objx.message.function == 'debug') process.stdout.write(`\n\u001b[41mDEBUG>\u001b[0m  ${objx.message.string}\n`);
	if (objx.message.function == 'wrapperStdout') process.stdout.write(objx.message.string);
	if (objx.message.function == 'serverStdout') objx.server.stdin.write(objx.message.string);
}

function debug(string) {
	process.send({function: 'wrapperStdout', string: `\n\u001b[41mDEBUG>\u001b[0m  ${string}\n`});
}

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