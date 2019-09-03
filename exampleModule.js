const thisModule = 'moduleName';

// Import core packages
const modul = new [require('./modul.js')][0](thisModule)
const fn = {}

// Set defaults
var sS = {} // serverSettings
var mS = {} // moduleSettings

// Module command handling
process.on('message', async message => {
	switch (message.function) {
		case 'init':
			[sS, mS] = modul.loadSettings(message)
			break;
		case 'execute':
			fn[message.func](message.data)
			.then(data => modul.resolve(data, message.promiseId, message.returnModule))
			.catch(err => modul.reject(err, message.promiseId, message.returnModule))
			break;
		case 'pushSettings':
			[sS, mS] = modul.loadSettings(message)
			break;
	}
});