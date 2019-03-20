var backupJS = reload('Z:/wrapperModules/backup.js');
var globalArgs = {};

module.exports.process = function (command) { 
    if (command == "!backup") { 
    	backupJS.backup()
    	return {echo: ''}
    }
	if (command == 'startInterval') {  }
	if (command == 'clearInterval') { m.backupTimer.clearInterval(); }
};

module.exports.preload = function (globalArgs) {
	globalArgs = globalArgs;
}

function regularCommandCheck(message) {
	if (message.slice(0, 4) == "!list") return true;
	if (message.slice(0, 9) == "!forge tps") return true;
}