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
			timeToNextBackup = moment().add(mS.backupIntervalInHours, 'hours');
			pushStats();
			startBackupInterval();
			break;
		case 'startBackupInterval':
			startBackupInterval();
			break;
		case 'clearBackupInterval':
			clearInterval(backupInterval);
			break;
		case 'setBackupInterval':
			clearInterval(backupInterval);
			mS.backupIntervalInHours = message.backupIntervalInHours;
			startBackupInterval();
			if (message.save) saveSettings();
			break;
		case 'setBackupDir':
			mS.overrideBackupDir = message.backupDir;
			if (message.save) saveSettings();
			break;
		case 'runBackup':
			runBackup();
			break;
		case 'fetchStats':
			pushStats();
			break;
		case 'nextBackup':
			process.send({
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: [{
							function: 'nextBackup',
							vars: { timeToNextBackup: timeToNextBackup }
						}],
						logTo: message.logTo
					}
				}
			});
			break;
		case 'lastBackup':
			process.send({
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: [{
							function: 'lastBackup',
							vars: { lastBackupStartTime: lastBackupStartTime }
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
		message: { function: 'pushStats', serverStats: { timeToNextBackup: timeToNextBackup.fromNow(), timeSinceLastBackup: (lastBackupEndTime != null) ? lastBackupEndTime.fromNow() : null, lastBackupDuration: lastBackupDurationString } }
	});
}

function startBackupInterval() {
	backupInterval = setInterval(function(){
		runBackup();
		timeToNextBackup = moment().add(mS.backupIntervalInHours, 'hours');
	}, mS.backupIntervalInHours*60*60*1000);
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

function saveSettings() {
	sS.modules['backup'].settings = mS;
	process.send({ function: 'saveSettings', sS: sS })
}
