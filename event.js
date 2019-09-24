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
            let match = string.replace(/\n|\r/g, '').match(event.matchRegex);
            if (match) { // || eventKey == "PlayerMessage"
                match = Array.from(match);
                let filled = {};
                filled.text = event.text;
                filled.embed = event.embed;
                if (event.matchRelation) event.matchRelation.forEach(async (matchedWord, i) => {
                    if (event.send.text) filled.text = filled.text.replace(matchedWord, match[i+1]);
                    else filled.text = '';
                    if (event.send.embed) {
                        for (key in filled.embed) {
                            if (typeof filled.embed[key] == "object") { 
                                for (childKey in filled.embed[key]) {
                                    if (typeof filled.embed[key][childKey] == "object") {
                                        for (granChildKey in filled.embed[key][childKey]) {
                                            if (typeof filled.embed[key][childKey] != "object") filled.embed[key][childKey][granChildKey].replace(matchedWord, match[i+1])
                                        }
                                    } else filled.embed[key][childKey] = filled.embed[key][childKey].replace(matchedWord, match[i+1])
                                }
                            } else filled.embed[key] = filled.embed[key].replace(matchedWord, match[i+1])
                        }
                    } else filled.embed = {};
                })
                filled.embed.author.icon_url = `https://crafatar.com/renders/head/${(await modul.call('mineapi', 'getPlayer', filled.embed.author.icon_url))._uuid}?size=128&default=MHF_Steve&overlay`
                modul.emit('serverEvent', { eventKey: eventKey, event: event, filled: filled })
            }
        }
    }
}

async function buildMatches() {
	for (key in mS.eventTranslation) {
		if (mS.eventTranslation[key].match) {
			mS.eventTranslation[key].matchRelation = mS.eventTranslation[key].match.match(/\%(.*?)\%/g);
            mS.eventTranslation[key].matchRegex = `.* ${mS.eventTranslation[key].match.replace(/\%(.*?)\%/g, '(.*?)')}$`;
        }
	}
	return;
}