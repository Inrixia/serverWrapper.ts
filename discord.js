// Import core packages
const properties = require('properties');
const discordjs = require("discord.js");
const util = require("./util.js");

// Set defaults
const discord = new discordjs.Client();
let sS = {} // serverSettings
let mS = {} // moduleSettings
let managementChannel = null; // This will be assigned the management channel when the server starts
let chatChannel = null; 
let discordData = "";
let previousMessage = "";
let serverStarted = true;

// Module command handling
process.on('message', async message => {
	switch (message.function) {
		case 'init':
			sS = message.sS;
			mS = sS.modules['discord'].settings;
			buildMatches().then(openDiscord);
			break;
		case 'kill':
			process.exit();
			break;
		case 'serverStdout':
			serverStdout(message.string);
			break;
		case 'consoleStdout':
			if (managementChannel) managementChannel.send(`[BOX] > ${message.string}\n`, { split: true })
			break;
		case 'discordStdin':
			let channel = managementChannel;
			if (message.channel) channel = discord.guilds.get('155507830076604416').channels.get(message.channel)
			else if (message.userID) channel = discord.users.get(message.userID);

			if (channel && message.embed) channel.send({embed: message.embed});
			else if (channel && message.string) channel.send(message.string, { split: true });
			break;
		case 'pushSettings':
			sS = message.sS;
			mS = sS.modules['discord'].settings;
			buildMatches();
			break;
	}
});

async function openDiscord() {
	// Fetch discordToken to use and display it at launch
	console.log(`Using Discord Token: ${sS.c[sS.modules['discord'].color].c}${mS.discordToken}${sS.c['reset'].c}`);
	discord.login(mS.discordToken);
}

// On discord client login
discord.on('ready', () => {
	managementChannel = discord.guilds.get('155507830076604416').channels.get(mS.managementChannelId);
	if(mS.chatLink.chatChannelId) chatChannel = discord.guilds.get('155507830076604416').channels.get(mS.chatLink.chatChannelId);
	properties.parse('./server.properties', {path: true}, (err, properties) => {
		if (err) util.lErr(err);
		else discord.user.setActivity(properties.motd.replace(/§./g, '').replace(/\n.*/g, '').replace('// Von Spookelton - ', '').replace(' \\\\', ''), { type: 'WATCHING' })
	});
})

// On receive message from discord server
discord.on('message', async message => {
	let discordMessage = {
		channel : {
			id: ((message.channel||{}).id||null),
			name: ((message.channel||{}).name||null),
			calculatedPosition: ((message.channel||{}).calculatedPosition||null),
			type: ((message.channel||{}).type||null)
		},
		user: {
			id: ((discord.user||{}).id||null),
			username: ((discord.user||{}).username||null),
			avatar: ((discord.user||{}).avatar||null),
			avatarURL: ((discord.user||{}).avatarURL||null)
		},
		author: {
			id: ((message.author||{}).id||null),
			username: ((message.author||{}).username||null),
			avatarURL: ((message.author||{}).avatarURL||null)
		},
		member: {
			roles: (((message.member||{}).roles||new discordjs.Collection()).array()||null)
		},
		mentions: {
			users: (((message.mentions||{}).users||new discordjs.Collection()).map(function(mentionedUser) {
				return {
					id: ((mentionedUser||{}).id||null),
					username: ((mentionedUser||{}).username||null),
					avatar: ((mentionedUser||{}).avatar||null),
					avatarURL: ((mentionedUser||{}).avatarURL||null)
				};
			})||null),
			roles: (((message.mentions||{}).roles||new discordjs.Collection()).map(function(mentionedRole) {
				return {
					id: ((mentionedRole||{}).id||null),
					name: ((mentionedRole||{}).name||null),
					color: ((mentionedRole||{}).color||null)
				};
			})||null),
			channels: (((message.mentions||{}).channels||new discordjs.Collection()).map(function(mentionedChannel) {
				return {
					id: ((mentionedChannel||{}).id||null),
					name: ((mentionedChannel||{}).name||null),
					calculatedPosition: ((mentionedChannel||{}).calculatedPosition||null),
					type: ((mentionedChannel||{}).type||null)
				};
			})||null),
			everyone: (((message.mentions||{}).everyone||new discordjs.Collection()).array()||null)
		}
	}
	if (message.isMemberMentioned(discord.user)) discordMessage.string = message.toString().trim().slice(message.toString().trim().indexOf(' ')+1, message.toString().trim().length)
	else if (message.channel.id == mS.managementChannelId && message.author.id != discord.user.id) discordMessage.string = message.toString().trim();
	if (discordMessage.string) util.pSend(process, {
		function: 'broadcast',
		message: {
			function: 'discordMessage',
			message: discordMessage
		}
	});
	if(chatChannel && discordMessage.channel.id === mS.chatLink.chatChannelId) {
		// util.pSend(process, {
		// 	function: 'serverStdin',
		// 	string: `/say ${discordMessage.user.username}: ${discordMessage.string}`
		// });
	}
	/*if (message.toString() == '^') {
		message.channel.send(`
		${"```"}javascript
		parentObject: {
			childObject: {
				childTitle: 'Blah'
			}
		}${"```"}`, { split: true }).then(responseMessage => {
			responseMessage.react('⬆');
			responseMessage.react('⬇');

			let reactFilter = (reaction, user) => reaction.emoji.name === '⬆' || ;
			responseMessage.awaitReactions(reactFilter, {time: 5000}).then(reactions => {
				debug((reactions.first().name == '⬆') + 'up')
				debug((reactions.first().name == '⬇') + 'down')
			});
		})
	}*/
})

async function sendChat(msg) { if (chatChannel) chatChannel.send(msg, { split: true }); }
async function serverStdout(string) {
	if (string == previousMessage) return;
	previousMessage = string;

	// every message we send spawns another stdout, so we don't want to infinite loop
	if (string.includes('DiscordIntegration')) return;

	discordData += string;
	setTimeout(() => {
		if (discordData != "" && managementChannel) {
			managementChannel.send(discordData, { split: true })
			discordData = "";
		}
	}, mS.discordMessageFlushRate);

	


	if(!serverStarted) {
		serverStarted = true;
		sendChat("Server Started");
	} else {
		for (let eventKey in mS.chatLink.eventTranslation) {
			let event = mS.chatLink.eventTranslation[eventKey];
			if (event.match != false) {
				if (string.search(event.matchRegex) > -1 && (string.indexOf('>') == -1 || eventKey == "PlayerMessage")) {
					let match = Array.from(string.match(event.matchRegex));
					let content = event.content;
					event.matchRelation.forEach(async (matchedWord, i) => {
						if (event.send.content) content = content.replace(matchedWord, match[i+1]);
						if (event.send.embed) {
							for (key in event.embed) {
								if (typeof event.embed[key] == "object") { 
									for (childKey in event.embed[key]) {
										if (typeof event.embed[key][childKey] == "object") {
											for (granChildKey in event.embed[key][childKey]) {
												if (typeof event.embed[key][childKey] != "object") event.embed[key][childKey][granChildKey].replace(matchedWord, match[i+1])
											}
										} else event.embed[key][childKey] = event.embed[key][childKey].replace(matchedWord, match[i+1])
									}
								} else event.embed[key] = event.embed[key].replace(matchedWord, match[i+1])
							}
						}
					})
					console.log(event.embed)
					// let msg = {
					// 	embed: event.send.embed?embed:'',
					// 	content: event.send.content?content:''
					// }
					break;
				}
			}
		}
	}
}

async function buildMatches() {
	for (key in mS.chatLink.eventTranslation) {
		if (mS.chatLink.eventTranslation[key].match) {
			mS.chatLink.eventTranslation[key].matchRelation = mS.chatLink.eventTranslation[key].match.match(/\%(.*?)\%/g);
			mS.chatLink.eventTranslation[key].matchRegex = '.* '+mS.chatLink.eventTranslation[key].match.replace(/\%(.*?)\%/g, '(.*?)')+'\\n$';
		}
	}
	return;
}