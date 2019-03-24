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
var color = "";

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			sS = message.sS;
			mS = sS.modules['discord'].settings;
			color = message.color;
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
			if (management_channel) management_channel.send(message.string+"\n", { split: true })
			break;
		case 'pushSettings':
			sS = message.sS;
			mS = sS.modules['discord'].settings;
			break;
	}
});

function openDiscord() {
	// Fetch discord_token to use and display it at launch
	console.log(`Using Discord Token: ${color}${mS.discord_token}${sS.c['reset']}`);
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
	if (message.channel.id == mS.management_channel_id && message.author.id != discord.user.id) {
		process.send({
			function: 'broadcast',
			message: {
				function: 'discordMessage',
				message: {
					author: {
						id: message.author.id,
						username: message.author.username
					},
					member: {
						roles: message.member.roles.array()
					},
					string: message.toString().trim(),
					mentions: {
						users: {
							first: {
								id: message.mentions.users.first() ? message.mentions.users.first().id : null,
								username: message.mentions.users.first() ? message.mentions.users.first().username : null,
							}
						},
						roles: {
							first: {
								id: message.mentions.roles.first() ? message.mentions.roles.first().id : null,
								name: message.mentions.roles.first() ? message.mentions.roles.first().name: null
							}
						}
					}
				}
			}
		});
	}
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

function debug(stringOut) {
	try {
		if (typeof stringOut === 'string') process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset']} ${stringOut}\n\n`)
		else {
			process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset']}`);
			console.log(stringOut);
		}
	} catch (e) {
		process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset']} ${stringOut}\n\n`);
	}
}
