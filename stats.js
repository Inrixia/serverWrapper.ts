const thisModule = 'stats';

// Import core packages
const pidusage = require('pidusage');


// Set defaults
let sS = {} // serverSettings
let mS = {} // moduleSettings
let serverStats = { serverName: '', status: 'Init', pid: '', mem: '', cpu: '', uptime: '', timeToBackup: 'Backups Disabled' }; // Default stats
let statsInterval = null;

let moduleStart = null;

const modul = new [require('./modul.js')][0](thisModule)
let fn = {
	init: async message => {
		[sS, mS] = modul.loadSettings(message)
		serverStats.serverName = sS.serverName;
		modul.event.on('pushStats', async stats => {
			Object.assign(serverStats, stats);
		})
		clearInterval(statsInterval);
		fn.startInterval();
	}, 
	startStatsInterval: async message => { // Start sending frequent stats updates
		if (message.stats.status == 'Starting') moduleStart = Date.now();
		else if (message.stats.status == 'Running') moduleStart = null;
		Object.assign(serverStats, message.stats);
		await updateServerStats();
		sendStatsUpdate();
		clearInterval(statsInterval);
		fn.startInterval();
	},
	startInterval: async () => {
		statsInterval = setInterval(async () => {
			modul.emit('fetchStats')
			await updateServerStats();
			sendStatsUpdate()
		}, mS.pollRate)
	},
	clearStatsInterval: async () => clearInterval(statsInterval),
	pushStats: async stats => Object.assign(serverStats, stats)
};

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'execute':
			if (!(message.func in fn)) modul.reject(new Error(`Command ${message.func} does not exist in module ${thisModule}`), message.promiseId, message.returnModule)
			else fn[message.func](message.data)
			.then(data => modul.resolve(data, message.promiseId, message.returnModule))
			.catch(err => modul.reject(err, message.promiseId, message.returnModule))
			break;
		case 'pushSettings':
			[sS, mS] = modul.loadSettings(message)
			break;
	}
});

async function sendStatsUpdate() {
	if (moduleStart != null && sS.lastStartTime) {
		let timeSinceStart = Date.now()-moduleStart;
		if (sS.lastStartTime-timeSinceStart < 0) moduleStart = null;
		serverStats.status = `Remaining boot time: ${sS.lastStartTime-timeSinceStart}ms`
	} 
	let sName = `${serverStats.serverName} - ${serverStats.status}`
	let PID = `PID: ${serverStats.pid}`
	let Mem = `Mem: ${Math.round(serverStats.mem/1024/1024)}MB`
	let CPU = `CPU: ${Math.round(serverStats.cpu/8)}%`
	let Uptime = `Uptime: ${Math.round(serverStats.uptime/1000/60)} Min`
	let lstB = `${serverStats.timeSinceLastBackup ? `Last Backup: ${serverStats.timeSinceLastBackup}`: 'No backup yet'}`
	let lstBD = `${serverStats.lastBackupDuration ? ` Took: ${serverStats.lastBackupDuration}`:''}`
	let TTB = `${serverStats.timeToNextBackup ? ` Next In: ${serverStats.timeToNextBackup}`:''}`
	process.stdout.write(`${String.fromCharCode(27)}]0;${sName}  |  ${PID}  |  ${Mem}  |  ${CPU}  |  ${Uptime}  |  ${lstB+lstBD+TTB}${String.fromCharCode(7)}`);
};

async function updateServerStats() { // Get info for a running server from its PID
	if (serverStats.pid) pidusage(serverStats.pid, (err, stats) => {
		if (err) throw err;
		serverStats.cpu = (stats||{}).cpu;
		serverStats.mem = (stats||{}).memory;
		serverStats.uptime = (stats||{}).elapsed;
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