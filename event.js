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
        modul.event.on('serverStdout', message => serverStdout(message).catch(err => modul.lErr(err, 'Error while event.js processed server message.')))
        let startEvent = mS.eventTranslation['Started'];
        modul.event.on('serverStarted', () => {
            modul.emit('serverEvent', { 
                eventKey: 'Started', 
                event: startEvent, 
                filled: {
                    text: startEvent.send.text?startEvent.text:null,
                    embed: startEvent.send.embed?startEvent.embed:null
                }
            })
        })
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

const fillEmbed = async (obj, match, fill) => {
    let tKey;
    for (i in Object.keys(obj)) {
        tKey = Object.keys(obj)[i]
        if (typeof obj[tKey] == 'object') obj[tKey] = await fillEmbed(obj[tKey], match, fill)
        else {
            obj[tKey] = obj[tKey].replace(match, fill)
            if (obj[tKey] == fill+' image') obj[tKey] = `https://crafatar.com/renders/head/${(await modul.call('mineapi', 'getPlayer', fill))._uuid}?size=128&default=MHF_Steve&overlay`
        }
    }
    return obj;
}
async function serverStdout(string) {
    let event = {};
    if (string.indexOf('>') == -1) for (eventKey in mS.eventTranslation) {
        event = mS.eventTranslation[eventKey];
        let match = string.replace(/\n|\r/g, '').match(event.matchRegex);
        if (match) handleEvent(match, event, eventKey)
    } else {
        event = mS.eventTranslation['PlayerMessage'];
        let match = string.replace(/\n|\r/g, '').match(event.matchRegex);
        if (match) handleEvent(match, event, 'PlayerMessage')
    }
}

async function handleEvent(match, event, eventKey) {
    match = Array.from(match);
    let filled = {};
    filled.text = JSON.stringify(event.text);
    filled.embed = Object.assign({}, event.embed);
    if (event.matchRelation) await Promise.all(event.matchRelation.map(async (matchedWord, i) => {
        if (event.send.text) filled.text = filled.text.replace(matchedWord, match[i+1]);
        else filled.text = '';
        await fillEmbed(filled.embed, matchedWord, match[i+1])
    }))
    modul.emit('serverEvent', { eventKey: eventKey, event: event, filled: filled })
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