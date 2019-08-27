// Import core packages
const modul = require("./modul.js")

const thisModule = 'command';
const fn = {}

// Set defaults
var sS = {} // serverSettings
var mS = {} // moduleSettings

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'execute':
			fn[message.func](message.data)
			.then(data => modul.resolve(data, message.promiseId, message.returnModule))
			.catch(err => modul.reject(err, message.promiseId, message.returnModule))
			break;
		case 'promiseResolve':
			modul.promiseResolve(message);
			break;
		case 'promiseReject':
			modul.promiseReject(message);
			break;
		case 'pushSettings':
			[sS, mS] = modul.pushSettings(message, thisModule)
			break;
		case 'init':
			[sS, mS] = modul.init(message, thisModule)
			break;
		case 'kill':
			modul.kill(message);
			break;
	}
});