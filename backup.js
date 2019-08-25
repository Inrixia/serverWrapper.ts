// Import core packages
const moment = require('moment');
const properties = require('properties');
const fs = require('fs');
const util = require('./util.js');

// Set defaults
let sS = {} // serverSettings
let mS = {} // moduleSettings
let backupInterval = null;
let timeToNextBackup = null;
let lastBackupDuration = null;
let lastBackupStartTime = null;
let lastBackupEndTime = null;
let lastBackupDurationString = null;

// Module command handling
process.on('message', async message => {
	switch (message.function) {
		case 'init':
			sS = message.sS;
			mS = sS.modules['backup'].settings;
			startBackupInterval().catch(err => util.lErr(err, 'startBackupInterval failed during backup.js init!'));
			break;
		case 'kill':
				process.exit();
				break;
		case 'pushSettings':
			sS = message.sS;
			mS = sS.modules['backup'].settings;
			break;
		case 'startBackupInterval':
			if (backupInterval) clearInterval(backupInterval);
			let logInfoArray = await startBackupInterval().catch(err => util.lErr(err, 'function call startBackupInterval Failed!', message.logTo));
			if (message.logTo) util.pSend(process, {
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: logInfoArray,
						logTo: message.logTo
					}
				}
			}).catch(err => util.lErr(err, '', message.logTo));;
			break;
		case 'clearBackupInterval':
			let executionStartTime = new Date();
			clearInterval(backupInterval)
			timeToNextBackup = null;
			pushStats();
			if (message.logTo) util.pSend(process, {
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: [{
							function: 'clearBackupInterval',
							vars: {
								executionStartTime: executionStartTime,
								executionEndTime: new Date()
							}
						}],
						logTo: message.logTo
					}
				}
			}).catch(err => util.lErr(err, '', message.logTo));
			break;
		case 'setBackupInterval':
			executionStartTime = new Date();
			clearInterval(backupInterval);
			logInfoArray = [{
				function: 'clearBackupInterval',
				vars: {
					executionStartTime: executionStartTime,
					executionEndTime: new Date()
				}
			}];
			mS.backupIntervalInHours = message.backupIntervalInHours;
			timeToNextBackup = moment().add(mS.backupIntervalInHours, 'hours');
			logInfoArray = logInfoArray.concat(await startBackupInterval());
			if (message.logTo) util.pSend(process, {
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: logInfoArray,
						logTo: message.logTo
					}
				}
			}).catch(err => util.lErr(err, '', logTo));;
			if (message.save.toLowerCase() == 'true') util.saveSettings(message.logTo).catch(err => util.lErr(err, '', message.logTo));;
			break;
		case 'setBackupDir':
			mS.overrideBackupDir = message.backupDir;
			if (message.save) util.saveSettings(message.logTo).catch(err => util.lErr);;
			break;
		case 'getBackupDir':
			executionStartTime = new Date();
			if (message.logTo) util.pSend(process, {
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: [{
							function: 'backupDir',
							vars: {
								backupDir: (mS.overrideBackupDir) ? mS.overrideBackupDir : mS.remoteRootBackupDir+sS.serverName,
								executionStartTime: executionStartTime,
								executionEndTime: new Date()
							}
						}],
						logTo: message.logTo
					}
				}
			}).catch(err => util.lErr(err, '', logTo));;
			break;
		case 'runBackup':
			runBackup();
			break;
		case 'fetchStats':
			pushStats();
			break;
		case 'nextBackup':
			executionStartTime = new Date();
			if (message.logTo) util.pSend(process, {
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: [{
							function: 'nextBackup',
							vars: {
								timeToNextBackup: timeToNextBackup,
								executionStartTime: executionStartTime,
								executionEndTime: new Date()
							}
						}],
						logTo: message.logTo
					}
				}
			});
			break;
		case 'lastBackup':
			executionStartTime = new Date();
			if (message.logTo) util.pSend(process, {
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: [{
							function: 'lastBackup',
							vars: {
								lastBackupStartTime: lastBackupStartTime,
								lastBackupDuration: lastBackupDurationString,
								executionStartTime: executionStartTime,
								executionEndTime: new Date()
							}
						}],
						logTo: message.logTo
					}
				}
			});
			break;
	}
});
async function pushStats() {
	util.pSend(process, {
		function: 'unicast',
		module: 'stats',
		message: { function: 'pushStats', serverStats: { timeToNextBackup: timeToNextBackup ? timeToNextBackup.fromNow() : 'Backups disabled', timeSinceLastBackup: (lastBackupEndTime != null) ? lastBackupEndTime.fromNow() : null, lastBackupDuration: lastBackupDurationString } }
	});
	return;
}

async function startBackupInterval() {
	let executionStartTime = new Date();
	timeToNextBackup = moment().add(mS.backupIntervalInHours, 'hours');
	pushStats();
	backupInterval = setInterval(async () => {
		await runBackup();
		timeToNextBackup = moment().add(mS.backupIntervalInHours, 'hours');
	}, mS.backupIntervalInHours*60*60*1000);
	return [{
		function: 'startBackupInterval',
		vars: {
			timeToNextBackup: timeToNextBackup,
			executionStartTime: executionStartTime,
			executionEndTime: new Date()
		}
	}]
}

async function runBackup() {
	lastBackupStartTime = moment();
	util.pSend(process, { function: 'serverStdin', string: 'save-off\n' });
	process.stdout.write('Starting Backup - World Saving Disabled\n');
	util.pSend(process, { function: 'serverStdin', string: `/title @a actionbar ["",{"text":"~","color":"light_purple"},{"text":" Starting Backup","color":"white"},{"text":" ~","color":"light_purple"}]\n` })
	util.pSend(process, {
		function: 'unicast',
		module: 'stats',
		message: { function: 'pushStats', serverStats: { status: 'Backing Up', timeToBackup: timeToNextBackup.fromNow() } }
	});
	let backupDir = mS.overrideBackupDir ? mS.overrideBackupDir : mS.remoteRootBackupDir+sS.serverName;
	//children.spawn('robocopy', [sS.modules['properties'].settings.p['level-name'], `${backupDir}/${moment().format('MMMMDDYYYY_h-mm-ssA')}/Cookies`, (mS.threads > 1) ? `/MT:${mS.threads}` : '', '/E'], {shell: true, detached: true}).on('close', function (code) {
	
	await util.pExec(`ssh ${mS.remoteUser}@${mS.remoteIP} -p ${mS.remotePort} \
	"mkdir -p ${backupDir} && mkdir -p ${mS.remotePublicRootBackupDir}/${sS.serverName}/ && mkdir -p mkdir -p ${mS.remotePublicRootBackupDir}/${sS.serverName}/latest/"`)

	await util.pExec(`rsync-snapshot --src ${sS.server_dir} --shell "ssh -p ${mS.remotePort}" \
	--dst ${mS.remoteUser}@${mS.remoteIP}:${backupDir} --setRsyncArg exclude='*.log' --setRsyncArg exclude='*.zip' \
	--setRsyncArg exclude='*.rar' --setRsyncArg exclude='*node_modules*' --maxSnapshots 100000`)

	let info = await util.pExec(`ssh ${mS.remoteUser}@${mS.remoteIP} -p ${mS.remotePort} "ls /mnt/redlive/LiveArchives/${sS.serverName}"`)
	let latestFolder = info.split(/\r?\n/).slice(-3, -2)[0];
	//console.log(`ln -s ${backupDir}/${latestFolder}/${sS.serverName}/${sS.modules['properties'].settings.p['level-name']} ${mS.remotePublicRootBackupDir}/${sS.serverName}/${latestFolder} && ln -s ${backupDir}/latest/${sS.serverName}/${sS.modules['properties'].settings.p['level-name']} ${mS.remotePublicRootBackupDir}/${sS.serverName}/latest`)
	
	mS.publicBackupFolders.forEach(async folder => {
		if (folder == 'DEFAULT') folder = sS.modules['properties'].settings.p['level-name'];
		await util.pExec(`ssh ${mS.remoteUser}@${mS.remoteIP} -p ${mS.remotePort} \
		"mkdir -p ${mS.remotePublicRootBackupDir}/${sS.serverName}/${latestFolder}"`)

		util.pExec(`ssh ${mS.remoteUser}@${mS.remoteIP} -p ${mS.remotePort} \
		"ln -s ${backupDir}/${latestFolder}/${sS.serverName}/${folder} \
		${mS.remotePublicRootBackupDir}/${sS.serverName}/${latestFolder}/${folder} \
		&& ln -s ${backupDir}/latest/${sS.serverName}/${folder} \
		${mS.remotePublicRootBackupDir}/${sS.serverName}/latest/${folder}"`);
	})

	lastBackupEndTime = moment();
	lastBackupDuration = moment.duration(lastBackupEndTime.diff(lastBackupStartTime));
	let t = {
		ms: lastBackupDuration.milliseconds(),
		s: lastBackupDuration.seconds(),
		m: lastBackupDuration.minutes(),
		h: lastBackupDuration.hours()
	}
	lastBackupDurationString = `${(t.m>0) ? `${t.m}min, ` : ''}${(t.s>0) ? `${t.s}sec, ` : ''}${(t.ms>0) ? `${t.ms}ms` : ''}`;
	util.pSend(process, { function: 'serverStdin', string: 'save-on\n' });
	process.stdout.write(`Backup Completed in ${lastBackupDurationString} - World Saving Enabled\n`);
	util.pSend(process, { function: 'serverStdin', string: `/title @a actionbar ["",{"text":"~","color":"light_purple"},{"text":" Finished Backup","color":"white"},{"text":" -","color":"light_purple"},{"text":" Took","color":"white"},{"text":" ${lastBackupDurationString}","color":"green"},{"text":" ~","color":"light_purple"}]\n` })
	pushStats();
}