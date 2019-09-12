const thisModule = 'moduleName';

// Set defaults
var sS = {}; // serverSettings
var sP = {}; // ServerProperties

// Import core packages
const modul = new [require('./modul.js')][0](thisModule)
let fn = {
	init: async message => [sS, mS] = modul.loadSettings(message)
};

// Module command handling
process.on('message', async message => {
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