const properties = require('properties');
const discord = require("discord.js");

// Import core packages
const pidusage = require('pidusage');


// Set defaults
var serverSettings = {}

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			serverSettings = message.serverSettings;
			break;
		case 'kill':
			process.exit();
			break;
	}
});

module.exports.init = function init(objx) { // function called on serverWrapper.js for stats.js init
	objx.thisProcess.send({function: 'init', serverSettings: objx.serverSettings});
}

module.exports.kill = function kill(objx) {
	objx.thisProcess.send({function: 'kill'})
}

module.exports.wrapperFunctionHandle = function wrapperFunctionHandle(objx) { // function called on serverWrapper.js to handle commands from stats.js
	if (objx.message.function == 'debug') process.stdout.write(`\n\u001b[41mDEBUG>\u001b[0m  ${objx.message.string}\n`);
	if (objx.message.function == 'wrapperStdout') process.stdout.write(objx.message.string);
	if (objx.message.function == 'serverStdout') objx.server.stdin.write(objx.message.string);
}

function debug(string) {
	process.send({function: 'wrapperStdout', string: `\n\u001b[41mDEBUG>\u001b[0m  ${string}\n`});
}


const discord_token = fs.readFileSync('./config/Chikachi/DiscordIntegration.json', 'utf8').slice(31, 90)
// Fetch discord_token to use and display it at launch
console.log('Using Discord Token: '+discord_token)

var channel = null; // This will be assigned the management channel when the server starts

discord.login(discord_token);

var discordData = "";
var consoleTimeout = true;

discord.on('ready', () => {
	// Begin Init Functions
	
	setTerminalTitle()
	// Start autobackup interval
	setInterval(backup, backupInterval*60*60*1000)
	properties.parse('server.properties', {path: true}, function(err, properties){
      	discord.user.setActivity(properties.motd.replace(/§./g, '').replace(/\n.*/g, '').replace('// Von Spookelton - ', '').replace(' \\\\', ''), { type: 'WATCHING' })
    });

	// Start the server
	channel = discord.guilds.get('155507830076604416').channels.get(channel_id);
	server = children.spawn('java', serverStartVars);
	sStats.pid = server.pid
	server.stdin.write('list\n')
	server.stdout.on('data', function (data) {
		process.stdout.write(data);
		if (!consoleTimeout) {
			if (data.indexOf('DiscordIntegration') == -1) {
				discordData += data
			}
		}
		setTimeout(function() {
			if (discordData != "") {
				channel.send(discordData, {split: true})
				discordData = "";
			}
		}, 100)
		if (data.indexOf("players online") > -1) {
			consoleTimeout = false;
			sStats.status = "Running";
			setTerminalTitle();
		}
	})

	// discord message handling
	discord.on('message', message => {
		if (message.channel.id == channel_id && message.author.id != discord.user.id && message.toString().slice(0,1) == "!") {
			// If its a mod then just forward whatever they say
			// If its a regular then let them run specific commands
			if (message.member.roles.has('344286675691896832') || (message.member.roles.has('317241332013989889') && regularCommandCheck(message.toString()))) {
				if (message.toString() == '!backup') { backup() }
				process.stdout.write('['+message.author.username+']: '+message.toString().slice(1,message.length).trim()+'\n');
				server.stdin.write(message.toString().slice(1,message.length).trim()+'\n')
			}

		}
	})

	// Console message handling
	stdin.addListener("data", function(d) {
		discordData += '[BOX] > '+d.toString().trim()+'\n'
		server.stdin.write(d.toString().trim()+'\n')
	});


	// Server shutdown handling
	server.on('exit', function (code) {
		channel.send('Server stopped with exit code: '+code+'\nRestarting server...');
	    console.log('Server stopped with exit code: '+code+'\nRestarting server...');
		setTimeout(function() {
		   	process.exit();
		}, 1000)
	});
});

properties.parse('server.properties', {path: true}, function(err, properties){
      	discord.user.setActivity(properties.motd.replace(/§./g, '').replace(/\n.*/g, '').replace('// Von Spookelton - ', '').replace(' \\\\', ''), { type: 'WATCHING' })
    });

    // discord message handling
	discord.on('message', message => {
		if (message.channel.id == channel_id && message.author.id != discord.user.id && message.toString().slice(0,1) == "!") {
			// If its a mod then just forward whatever they say
			// If its a regular then let them run specific commands
			if (message.member.roles.has('344286675691896832') || (message.member.roles.has('317241332013989889') && regularCommandCheck(message.toString()))) {
				if (message.toString() == '!backup') { backup() }
				process.stdout.write('['+message.author.username+']: '+message.toString().slice(1,message.length).trim()+'\n');
				server.stdin.write(message.toString().slice(1,message.length).trim()+'\n')
			}

		}
	})

	if (!consoleTimeout) {
		if (data.indexOf('DiscordIntegration') == -1) {
			discordData += data
		}
	}

	setTimeout(function() {
		if (discordData != "") {
			channel.send(discordData, {split: true})
			discordData = "";
		}
	}, 100)