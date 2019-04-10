// Import core packages
const moment = require('moment');
const children = require('child_process');
const properties = require('properties');

// Set defaults
var sS = {} // serverSettings
var mS = {} // moduleSettings
var backupInterval = null;
var timeToNextBackup = null;
var lastBackupDuration = null;
var lastBackupStartTime = null;
var lastBackupEndTime = null;
var serverWorldFolder = "";
var lastBackupDurationString = null;
properties.parse('./server.properties', {path: true}, function(err, properties) {
	serverWorldFolder = properties['level-name'];
});

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			sS = message.sS;
			mS = sS.modules['backup'].settings;
			startBackupInterval();
			break;
		case 'startBackupInterval':
			if (backupInterval) clearInterval(backupInterval);
			var logInfoArray = startBackupInterval();
			if (message.logTo) process.send({
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: logInfoArray,
						logTo: message.logTo
					}
				}
			});
			break;
		case 'clearBackupInterval':
			var executionStartTime = new Date();
			clearInterval(backupInterval);
			timeToNextBackup = null;
			pushStats();
			if (message.logTo) process.send({
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
			});
			break;
		case 'setBackupInterval':
			var executionStartTime = new Date();
			clearInterval(backupInterval);
			var logInfoArray = [{
				function: 'clearBackupInterval',
				vars: {
					executionStartTime: executionStartTime,
					executionEndTime: new Date()
				}
			}];
			mS.backupIntervalInHours = message.backupIntervalInHours;
			timeToNextBackup = moment().add(mS.backupIntervalInHours, 'hours');
			logInfoArray = logInfoArray.concat(startBackupInterval());
			if (message.logTo) process.send({
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: logInfoArray,
						logTo: message.logTo
					}
				}
			});
			if (message.save.toLowerCase() == 'true') saveSettings(message.logTo);
			break;
		case 'setBackupDir':
			mS.overrideBackupDir = message.backupDir;
			if (message.save) saveSettings(message.logTo);
			break;
		case 'getBackupDir':
			var executionStartTime = new Date();
			if (message.logTo) process.send({
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: [{
							function: 'backupDir',
							vars: {
								backupDir: (mS.overrideBackupDir) ? mS.overrideBackupDir : mS.rootBackupDir+sS.serverName,
								executionStartTime: executionStartTime,
								executionEndTime: new Date()
							}
						}],
						logTo: message.logTo
					}
				}
			});
			break;
		case 'runBackup':
			runBackup();
			break;
		case 'fetchStats':
			pushStats();
			break;
		case 'nextBackup':
			var executionStartTime = new Date();
			if (message.logTo) process.send({
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
			var executionStartTime = new Date();
			if (message.logTo) process.send({
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
		case 'kill':
			process.exit();
			break;
		case 'pushSettings':
			sS = message.sS;
			mS = sS.modules['backup'].settings;
			break;
	}
});

function pushStats() {
	process.send({
		function: 'unicast',
		module: 'stats',
		message: { function: 'pushStats', serverStats: { timeToNextBackup: timeToNextBackup ? timeToNextBackup.fromNow() : 'Backups disabled', timeSinceLastBackup: (lastBackupEndTime != null) ? lastBackupEndTime.fromNow() : null, lastBackupDuration: lastBackupDurationString } }
	});
}

function startBackupInterval() {
	let executionStartTime = new Date();
	timeToNextBackup = moment().add(mS.backupIntervalInHours, 'hours');
	pushStats();
	backupInterval = setInterval(function(){
		runBackup();
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

function runBackup() {
	lastBackupStartTime = moment();
	process.send({ function: 'serverStdin', string: 'save-off\n' });
	process.stdout.write('Starting Backup - World Saving Disabled\n');
	process.send({ function: 'serverStdin', string: `/title @a actionbar ["",{"text":"~","color":"light_purple"},{"text":" Starting Backup","color":"white"},{"text":" ~","color":"light_purple"}]\n` })
	process.send({
		function: 'unicast',
		module: 'stats',
		message: { function: 'pushStats', serverStats: { status: 'Backing Up', timeToBackup: timeToNextBackup.fromNow() } }
	});
	var backupDir = mS.overrideBackupDir ? mS.overrideBackupDir : mS.rootBackupDir+sS.serverName;
	children.spawn('robocopy', [serverWorldFolder, `${backupDir}/${moment().format('MMMMDDYYYY_h-mm-ssA')}/Cookies`, (mS.threads > 1) ? `/MT:${mS.threads}` : '', '/E'], {shell: true, detached: true}).on('close', function (code) {
		lastBackupEndTime = moment();
		lastBackupDuration = moment.duration(lastBackupEndTime.diff(lastBackupStartTime));
		var t = {
			ms: lastBackupDuration.milliseconds(),
			s: lastBackupDuration.seconds(),
			m: lastBackupDuration.minutes(),
			h: lastBackupDuration.hours()
		}
		lastBackupDurationString = `${(t.m>0) ? `${t.m}min, ` : ''}${(t.s>0) ? `${t.s}sec, ` : ''}${(t.ms>0) ? `${t.ms}ms` : ''}`;
		process.send({ function: 'serverStdin', string: 'save-on\n' });
		process.stdout.write(`Backup Completed in ${lastBackupDurationString} - World Saving Enabled\n`);
		process.send({ function: 'serverStdin', string: `/title @a actionbar ["",{"text":"~","color":"light_purple"},{"text":" Finished Backup","color":"white"},{"text":" -","color":"light_purple"},{"text":" Took","color":"white"},{"text":" ${lastBackupDurationString}","color":"green"},{"text":" ~","color":"light_purple"}]\n` })
		pushStats();
	})
}

/*
/ Util Functions
*/


function debug(stringOut) {
	try {
		if (typeof stringOut === 'string') process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset'].c.c} ${stringOut}\n\n`)
		else {
			process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset'].c}`);
			console.log(stringOut);
		}
	} catch (e) {
		process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset'].c} ${stringOut}\n\n`);
	}
}

function saveSettings(logTo) {
	sS.modules['backup'].settings = mS;
	process.send({ function: 'saveSettings', sS: sS, logTo: logTo })
}
