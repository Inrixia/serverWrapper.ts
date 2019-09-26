const thisModule = 'color';

const ColorThief = require('colorthief');


// Set defaults
let sS = {}; // serverSettings
let mS = {}; // ServerProperties

// Import core packages
const modul = new [require('./modul.js')][0](thisModule)
let fn = {
	init: async message => {
		[sS, mS] = modul.loadSettings(message)
		// modul.event.on('fetchCommands', () => {
		// 	modul.emit('exportCommands', []);
		// })
    },
    getColor: async url => {
        let cArr = await ColorThief.getColor(url)
        let hex = fullColorHex(cArr[0], cArr[1], cArr[2]);
        return {
            rgb: cArr,
            hex: hex,
            int: parseInt(hex, 16)
        }
    }
};
function fullColorHex(r, g, b) {
    return rgbToHex(r)+rgbToHex(g)+rgbToHex(b);
};
function rgbToHex(rgb) { 
    let hex = Number(rgb).toString(16);
    if (hex.length < 2) hex = "0" + hex;
    return hex;
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