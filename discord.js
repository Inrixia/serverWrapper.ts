// Import core packages
const properties = require('properties');
const discordjs = require("discord.js");

// Set defaults
const discord = new discordjs.Client();
var sS = {} // serverSettings
var mS = {} // moduleSettings
var server = null;
var discord_token = null;
var management_channel = null; // This will be assigned the management channel when the server starts
var discordData = "";
var previousMessage = "";

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			sS = message.sS;
			mS = sS.modules['discord'].settings;
			openDiscord();
			break;
		case 'kill':
			process.exit();
			break;
		case 'serverStdout':
			serverStdout(message.string);
			break;
		case 'consoleStdout':
			if (management_channel) management_channel.send(`[BOX] > ${message.string}\n`, { split: true })
			break;
		case 'discordStdin':
			var channel = management_channel;
			if (message.channel) channel = discord.guilds.get('155507830076604416').channels.get(message.channel)
			else if (message.userID) channel = discord.users.get(message.userID);

			if (channel && message.embed) channel.send({embed: message.embed});
			else if (channel && message.string) channel.send(message.string, { split: true });
			break;
		case 'pushSettings':
			sS = message.sS;
			mS = sS.modules['discord'].settings;
			break;
	}
});

function openDiscord() {
	// Fetch discord_token to use and display it at launch
	console.log(`Using Discord Token: ${sS.c[sS.modules['discord'].color].c}${mS.discord_token}${sS.c['reset'].c}`);
	discord.login(mS.discord_token);
}

// On discord client login
discord.on('ready', () => {
	management_channel = discord.guilds.get('155507830076604416').channels.get(mS.management_channel_id);
	properties.parse('./server.properties', {path: true}, function(err, properties) {
		if (err) console.log(err)
		else discord.user.setActivity(properties.motd.replace(/§./g, '').replace(/\n.*/g, '').replace('// Von Spookelton - ', '').replace(' \\\\', ''), { type: 'WATCHING' })
	});
})

// On receive message from discord server
discord.on('message', message => {
	var discordMessage = {
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
	else if (message.channel.id == mS.management_channel_id && message.author.id != discord.user.id) discordMessage.string = message.toString().trim();
	if (discordMessage.string) process.send({
		function: 'broadcast',
		message: {
			function: 'discordMessage',
			message: discordMessage
		}
	});
	// WIP interactive message
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

			var reactFilter = (reaction, user) => reaction.emoji.name === '⬆' || ;
			responseMessage.awaitReactions(reactFilter, {time: 5000}).then(reactions => {
				debug((reactions.first().name == '⬆') + 'up')
				debug((reactions.first().name == '⬇') + 'down')
			});
		})
	}*/
})

function serverStdout(string) {
	if (string == previousMessage) return;
	previousMessage = string;
	if (string.indexOf('DiscordIntegration') == -1) {
		discordData += string;
		setTimeout(function() {
			if (discordData != "" && management_channel) {
				management_channel.send(discordData, { split: true })
				discordData = "";
			}
		}, mS.discordMessageFlushRate)
	}
}


/*
/ Util Functions
*/

function debug(stringOut) {
	try {
		if (typeof stringOut === 'string') process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset'].c} ${stringOut}\n\n`)
		else {
			process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset'].c}`);
			console.log(stringOut);
		}
	} catch (e) {
		process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset'].c} ${stringOut}\n\n`);
	}
}

if (!('toJSON' in Error.prototype))
Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        var alt = {};

        Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key];
        }, this);

        return alt;
    },
    configurable: true,
    writable: true
});
