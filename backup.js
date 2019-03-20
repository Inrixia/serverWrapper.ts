const moment = require('moment');
var backupTimer = null;

// Define the backup start time variable and add one hour | This is not used for backup timing dont change it
backupStartTime = moment().add(backupInterval, 'hours');

const backupDir = rootBackupDir+serverName

module.exports.startInterval = function(backupDir, backupInterval) startInterval {
	backupTimer = setInterval(backup(backupDir, backupInterval), m.backupInterval*60*60*1000);
}

module.exports.clearInterval = function() { backupTimer.clearInterval(); }

module.exports.backup = function backup(backupDir, backupInterval) {
	backupStartTime = moment();
	process.send({
		command: 'save-off\n', 
		echo: 'Starting Backup - World Saving Disabled', 
		status: 'Backing Up...'
	})
	children.spawn('robocopy', ['Cookies', backupDir+moment().format('MMMMDDYYYY_h-mm-ssA')+'/Cookies', '/MT', '/E'], {shell: true, detached: true}).on('close', function (code) {
		lastBackup = moment();
		process.send({ 
			command: 'save-on\n', 
			echo: 'Backup Completed in '+moment.duration(moment().diff(backupStartTime)).humanize()+' - World Saving Enabled', 
			status: 'Running',
			lastBackup: moment().add(backupInterval, 'hours')
		})
	})
}


// Begin Backup Functions
	function backup() {
		server.stdin.write('save-off\n');
		sStats.status = "Backing Up...";
		setTerminalTitle()
		backupStartTime = moment();
		children.spawn('robocopy', ['Cookies', BackupDir+moment().format('MMMMDDYYYY_h-mm-ssA')+'/Cookies', '/MT', '/E'], {shell: true, detached: true}).on('close', function (code) {
			server.stdin.write('save-on\n');
			sStats.status = "Running";
			setTerminalTitle()
			backupStartTime.add(backupInterval, 'hours');
		})
	}
// End Backup Functions

// Start autobackup interval
	setInterval(backup, backupInterval*60*60*1000)