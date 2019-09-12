const thisModule = 'discord'

// Import core packages
const properties = require('properties');
const discordjs = require("discord.js");
const modul = new [require('./modul.js')][0](thisModule);



// Set defaults
const discord = new discordjs.Client();
let sS = {} // serverSettings
let mS = {} // moduleSettings
let managementChannel = null; // This will be assigned the management channel when the server starts
let chatChannel = null; 
let discordData = "";
let previousMessage = "";
let serverStarted = true;

let fn = {
	init: async message => {
		[sS, mS] = modul.loadSettings(message)
		modul.event.on('serverStdout', message => serverStdout(message))
		modul.event.on('consoleStdout', message => {
			if (managementChannel) managementChannel.send(`[BOX] > ${message}\n`, { split: true })
		})
		await buildMatches()
		await openDiscord();
	},
	discordStdin: async (message) => {
		let channel = managementChannel;
		if (message.channel) channel = discord.guilds.get('155507830076604416').channels.get(message.channel)
		else if (message.userID) channel = discord.users.get(message.userID);
		await channel.send(message.msg)
	}
}

// Module command handling
process.on('message', async message => {
	switch (message.function) {
		case 'execute':
			if (!(message.func in fn)) modul.reject(new Error(`Command ${message.func} does not exist in module ${thisModule}`), message.promiseId, message.returnModule)
			fn[message.func](message.data)
			.then(data => modul.resolve(data, message.promiseId, message.returnModule))
			.catch(err => modul.reject(err, message.promiseId, message.returnModule))
			break;
		case 'pushSettings':
			[sS, mS] = modul.loadSettings(message)
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
		if (err) modul.lErr(err);
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
			everyone: (((message.mentions||{}).everyone||new discordjs.Collection()).array()||null),
		}
	}
	discordMessage.logTo = {
		console: true,
		discord: { channel: discordMessage.channel.id }
	}
	if (message.isMemberMentioned(discord.user)) discordMessage.string = message.toString().trim().slice(message.toString().trim().indexOf(' ')+1, message.toString().trim().length)
	else if (message.channel.id == mS.managementChannelId && message.author.id != discord.user.id) discordMessage.string = message.toString().trim();
	if (discordMessage.string) modul.emit('discordMessage', discordMessage)
	if(chatChannel && discordMessage.channel.id === mS.chatLink.chatChannelId) {
		// modul.pSend(process, {
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
		for (eventKey in mS.chatLink.eventTranslation) {
			let event = mS.chatLink.eventTranslation[eventKey];
			if (event.match != false) {
				if ((string.search(event.matchRegex) > -1 && (string.indexOf('>') == -1) )) { // || eventKey == "PlayerMessage"
					let match = Array.from(string.match(event.matchRegex));
					let content = event.content;
					if (event.matchRelation) event.matchRelation.forEach(async (matchedWord, i) => {
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
				}
			}
		}
	}
}

async function buildMatches() {
	for (key in mS.chatLink.eventTranslation) {
		if (mS.chatLink.eventTranslation[key].match) {
			mS.chatLink.eventTranslation[key].matchRelation = mS.chatLink.eventTranslation[key].match.match(/\%(.*?)\%/g);
			mS.chatLink.eventTranslation[key].matchRegex = `.* ${mS.chatLink.eventTranslation[key].match.replace(/\%(.*?)\%/g, '(.*?)')}\\r\\n$`;
		}
	}
	return;
}

// Arrows

//     [player] was shot by arrow
//         This message is caused by arrows shot from a dispenser or /summon
//     [player] was shot by [player/mob]
//         Caused by mobs with projectile attacks or kills using a bow.
//     [player] was shot by [player/mob] using [bow name]
//         Caused by mobs or players with a renamed bow

// Cactus

//     [player] was pricked to death
//     [player] hugged a cactus
//     [player] walked into a cactus while trying to escape [player/mob]
//     [player] was stabbed to death
//         Console Edition only

// Drowning

//     [player] drowned
//     [player] drowned whilst trying to escape [player/mob]

// Elytra

//     [player] experienced kinetic energy
//     [player] removed an elytra while flying

// Explosions

//     [player] blew up
//     [player] was blown up by [player/mob]
//         This message shows up only when TNT is activated by a creeper or by a player using flint and steel or an arrow shot from a bow enchanted with Flame

// Falling

//     [player] hit the ground too hard
//         Only caused if the player is killed by a short fall, ender pearl damage, or riding an entity that died due to fall damage.
//     [player] fell from a high place
//         Caused by a fall greater than 5 blocks.
//     [player] fell off a ladder
//     [player] fell off some vines
//     [player] fell out of the water
//     [player] fell into a patch of fire
//     [player] fell into a patch of cacti
//     [player] was doomed to fall by [mob/player]
//     [player] was shot off some vines by [mob/player]
//     [player] was shot off a ladder by [mob/player]
//     [player] was blown from a high place by [mob/player]
//         Only caused if knockback from a creeper explosion, a ghast fireball, or player-lit TNT causes the player to fall to their death.

// Falling blocks

//     [player] was squashed by a falling anvil
//     [player] was squashed by a falling block
//         This message appears if the player is killed by a custom falling block other than an anvil that is modified to inflict damage

// Fire

//     [player] went up in flames
//         This message appears if the player died while in the source of the fire (unless the game rule firedamage has been set to false).
//     [player] burned to death
//         This message appears if the player died while on fire, but not in the source (unless the game rule firedamage has been set to false).
//     [player] was burnt to a crisp whilst fighting [player/mob]
//     [player] walked into a fire whilst fighting [player/mob]

// Firework rockets

//     [player] went off with a bang

// Lava

//     [player] tried to swim in lava
//     [player] tried to swim in lava while trying to escape [player/mob]

// Lightning

//     [player] was struck by lightning

// Magma Block

//     [player] discovered floor was lava

// Players and mobs

//     [player] was slain by [player/mob]
//     [player] was slain by [player/mob] using [weapon]
//         Caused by kills using a renamed weapon.
//     [player] got finished off by [player/mob]
//     [player] got finished off by [player/mob] using [weapon]
//         Caused by kills using a renamed weapon.
//     [player] was fireballed by [mob]
//         Only caused by blazes and ghasts

// Potions of Harming

//     [player] was killed by magic
//         Happens when the potion is shot from a dispenser, by drinking it, or with /effect
//     [player] was killed by [player/mob] using magic
//         Caused by witches, guardians, and kills using a splash potion

// Starving

//     [player] starved to death
//         Caused if the difficulty is Hard or Hardcore

// Suffocation

//     [player] suffocated in a wall
//         Happens if the player took suffocation damage from their head being in a block.
//     [player] was squished too much
//         Happens if the player took suffocation damage from the maxEntityCramming gamerule.

// Thorns enchantment

//     [player] was killed while trying to hurt [player/mob]
//         Can be caused by a mob if it is able to wear armor, and can also occur while fighting guardians

// Void

//     [player] fell out of the world
//         Also shown if the player is killed by the /kill command
//     [player] fell from a high place and fell out of the world

// Wither effect

//     [player] withered away

// Other

//     [victim] was pummeled by [killer]
//         This message would appear when killed by a snowball, an egg, a wither skull or an ender pearl
//         This message is unused in the case of snowballs, chicken eggs, and ender pearls, because they do not cause damage to players hit by them.
//         This message is currently only shown when the wither kills a player with a wither skull's impact.
//     [player] died
//         Pocket Edition only, used in some cases.