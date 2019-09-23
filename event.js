const thisModule = 'event';

// Set defaults
let sS = {}; // serverSettings
let mS = {}; // moduleSettings

// Import core packages
const modul = new [require('./modul.js')][0](thisModule)
let fn = {
	init: async message => {
        [sS, mS] = modul.loadSettings(message)
        await buildMatches()
        modul.event.on('serverStdout', message => serverStdout(message))
		// modul.event.on('fetchCommands', () => {
		// 	modul.emit('exportCommands', []);
		// })
	}
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

let event = {};
async function serverStdout(string) {
    if ((string.indexOf('>') == -1)) for (eventKey in mS.eventTranslation) {
        event = mS.eventTranslation[eventKey];
        if (event.match != false) {
            let match = JSON.stringify(string).match(event.matchRegex);
            if (match) { // || eventKey == "PlayerMessage"
                let content = event.content;
                match = Array.from(match);
                console.log(match, content)
                // if (event.matchRelation) event.matchRelation.forEach(async (matchedWord, i) => {
                //     if (event.send.content) content = content.replace(matchedWord, match[i+1]);
                //     if (event.send.embed) {
                //         for (key in event.embed) {
                //             if (typeof event.embed[key] == "object") { 
                //                 for (childKey in event.embed[key]) {
                //                     if (typeof event.embed[key][childKey] == "object") {
                //                         for (granChildKey in event.embed[key][childKey]) {
                //                             if (typeof event.embed[key][childKey] != "object") event.embed[key][childKey][granChildKey].replace(matchedWord, match[i+1])
                //                         }
                //                     } else event.embed[key][childKey] = event.embed[key][childKey].replace(matchedWord, match[i+1])
                //                 }
                //             } else event.embed[key] = event.embed[key].replace(matchedWord, match[i+1])
                //         }
                //     }
                // })
            }
        }
    }
}

async function buildMatches() {
	for (key in mS.eventTranslation) {
		if (mS.eventTranslation[key].match) {
			mS.eventTranslation[key].matchRelation = mS.eventTranslation[key].match.match(/\%(.*?)\%/g);
			mS.eventTranslation[key].matchRegex = `.* ${mS.eventTranslation[key].match.replace(/\%(.*?)\%/g, '(.*?)')}.*$`;
        }
	}
	return;
}