// Import core packages
const pidusage = require('pidusage');


// Set defaults
var sS = {} // serverSettings
var mS = {} // moduleSettings
var serverStats = { serverName: '', status: 'Init', pid: '', mem: '', cpu: '', uptime: '', timeToBackup: '' }; // Default stats
var statsInterval = null;

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			sS = message.sS;
			serverStats.serverName = sS.serverName;
			mS = sS.modules['stats'].settings;
			if (!message.sS.modules.backup.enabled) serverStats.timeToBackup = "Backups Disabled";
			if (message.server != null) {
				serverStats.pid = message.server.pid;
				serverStats.status = "Running"
				startStatsInterval();
			}
			sendStatsUpdate();
			break;
		case 'pushStats':
			Object.assign(serverStats, message.serverStats);
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
		case 'pushSettings':
			sS = message.sS;
			mS = sS.modules['stats'].settings;
			break;
	}
});

function startStatsInterval() { // Start sending frequent stats updates
	statsInterval = setInterval(function(){
		process.send({ function: 'broadcast', message: { function: 'fetchStats' } });
	}, mS.pollRate)
}

function sendStatsUpdate() {
	if (serverStats.pid != '') getPidUsage();
	process.stdout.write(`${String.fromCharCode(27)}]0;${serverStats.serverName} - ${serverStats.status}  |  PID: ${serverStats.pid}  |  Mem: ${Math.round(serverStats.mem/1024/1024)}MB  |  CPU: ${Math.round(serverStats.cpu/8)}%  |  Uptime: ${Math.round(serverStats.uptime/1000/60)} Min  |${serverStats.timeSinceLastBackup ? `  Last Backup: ${serverStats.timeSinceLastBackup}, Took: ${serverStats.lastBackupDuration}  |`: ''}  Next Backup: ${serverStats.timeToNextBackup}${String.fromCharCode(7)}`);
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


function debug(stringOut) {
	try {
		if (typeof stringOut === 'string') process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset'].c} ${stringOut}\n\n`)
		else {
			process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset'].c}`);
			console.log(stringOut);
		}
	} catch (e) {
		process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset'].c} ${stringOut}\n\n`);
	}
}
