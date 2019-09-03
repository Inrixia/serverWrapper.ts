const thisModule = 'auth';

// Import core packages
const modul = new [require('./modul.js')][0](thisModule)
const util = require('./util/fs.js');

const fn = {
	commandWhitelistAdd: async (message) => {
		// ~commandwhitelist add !list @Inrix 1 hour
		// ~commandwhitelist remove !list @Inrix 1 hour
		if (message.mentions.users[0].id) {
			let whitelisted_object = mS.whitelisted_discord_users[message.mentions.users[0].id];
			whitelisted_object.Username = message.mentions.users[0].username;
		} else if (message.mentions.roles[0].id) {
			let whitelisted_object = mS.whitelisted_discord_roles[message.mentions.roles[0].id];
			whitelisted_object.Name = message.mentions.roles[0].name;
		}
		if (!whitelisted_object.allowAllCommands) whitelisted_object.allowAllCommands = false;
	
		if (!whitelisted_object.allowedCommands) whitelisted_object.allowedCommands = {}
		let expiresin = message.args[3] ? new moment().add(message.args[3], message.args[4]) : false;
		whitelisted_object.allowedCommands[message.args[1].toLowerCase()] = {
			"assignedAt": new Date(),
			"assignedBy": {
				"Username": message.author.username,
				"discord_id": message.author.id
			},
			"expiresAt": expiresin, // If the user specifies a expiery time set it, otherwise use infinite
			"expired": false
		}
		await modul.saveSettings(sS, mS);
		return { wo: whitelisted_object, expiresin: expiresin };
	},	
	commandWhitelistRemove: async (message) => {
		if (message.args[0] == "~cw_removeall") {
			let whitelisted_object = mS.whitelisted_discord_users[message.mentions.users[0].id];
			if (message.mentions.users[0].id) delete mS.whitelisted_discord_users[message.mentions.users[0].id];
			else if (message.mentions.roles[0].id) delete mS.whitelisted_discord_roles[message.mentions.roles[0].id];
			await modul.saveSettings(sS, mS);
			return whitelisted_object
		} else {
			let whitelisted_object = mS.whitelisted_discord_users[message.mentions.users[0].id].allowedCommands[message.args[1].toLowerCase()];
			if (message.mentions.users[0].id) delete mS.whitelisted_discord_users[message.mentions.users[0].id].allowedCommands[message.args[1].toLowerCase()];
			else if (message.mentions.roles[0].id) delete mS.whitelisted_discord_roles[message.mentions.roles[0].id].allowedCommands[message.args[1].toLowerCase()];
			await modul.saveSettings(sS, mS);
			return whitelisted_object
		}
	}
}

// Set defaults
var sS = {} // serverSettings
var mS = {} // moduleSettings

// Module command handling
process.on('message', async message => {
	switch (message.function) {
		case 'init':
			[sS, mS] = modul.loadSettings(message)
			modul.event.on('discordMessage', message => processDiscordMessage(message).catch(err => modul.lErr))
			modul.event.on('serverStdout', message => processServerMessage(message).catch(err => modul.lErr))
			break;
		case 'execute':
			fn[message.func](message.data)
			.then(data => modul.resolve(data, message.promiseId, message.returnModule))
			.catch(err => modul.reject(err, message.promiseId, message.returnModule))
			break;
		case 'pushSettings':
			[sS, mS] = modul.loadSettings(message)
			break;
	}
});

async function checkCommandAuth(allowedCommands, message) {
	for (command in allowedCommands) {
		if (!allowedCommands[command.toLowerCase()].expired && (allowedCommands[command.toLowerCase()].expiresAt === false || new Date(allowedCommands[command.toLowerCase()].expiresAt) > new Date())) { // If permission has not expired
			if (command == "*") return true;
			else if (command == "!*" && message.string.slice(0, 1) == "!") return true;
			else if (command == "~*" && message.string.slice(0, 1) == "~") return true;
			if (message.string.slice(0, command.length) == command) return true; // If the command beginning matches return true
		} else {
			if (allowedCommands[command.toLowerCase()].expired && (message.string.slice(0, command.length) == command)) throw new Error('Allowed use of this command has expired.');
			if (!allowedCommands[command.toLowerCase()].expired) {
				allowedCommands[command.toLowerCase()].expired = true;
				await modul.saveSettings(sS, mS)
			}
		}
	};
	if (!authErr) throw new Error('User not allowed to run this command.');
}


async function checkDiscordAuth(message) {
	if (mS.whitelisted_discord_users[message.author.id]) { // If user matches a whitelisted user
		let whitelisted_user = mS.whitelisted_discord_users[message.author.id];
		if (whitelisted_user['Username'] != message.author.username) {
			whitelisted_user['Username'] = message.author.username;
			modul.saveSettings(sS, mS)
		}
		if (await checkCommandAuth(whitelisted_user.allowedCommands, message)) return true;
	}
	for (role_index in message.member.roles) {
		discord_role = message.member.roles[role_index];
		if (discord_role.id in mS.whitelisted_discord_roles) { // If user has a whitelisted role
			let whitelisted_role = mS.whitelisted_discord_roles[discord_role.id];
			if (whitelisted_role['Name'] != discord_role.name) {
				whitelisted_role['Name'] = discord_role.name;
				modul.saveSettings(sS, mS)
			}
			if (await checkCommandAuth(whitelisted_role.allowedCommands, message)) return true;
		};
	}
	if (!authErr) throw new Error('User not whitelisted.');
}

async function processDiscordMessage(message) {
	// "Mod" role id: 344286675691896832
	// "Admin" role id: 278046497789181954
	if ((message.string[0] == '~' || message.string[0] == '!' || message.string[0] == '?') && await checkDiscordAuth(message)) { // User is allowed to run this command
		process.stdout.write(`[${sS.c['brightCyan'].c}${message.author.username}${sS.c['reset'].c}]: ${message.string.trim()}\n`);
		if (message.string[0] == '~' || message.string[0] == '?') await modul.send('command', 'processCommand', message)
		else if (message.string[0] == '!') await modul.pSend(process, { function: 'serverStdin', string: message.string.slice(1,message.length).trim()+'\n' }) // Message is a serverCommand
	}
}

async function processServerMessage(message) {
	message = message.replace('\n', '');
	let commandString = null;
	let user = null;
	let commandType = '';
	if (message.indexOf('> ~') > -1) commandType = '~';
	else if (message.indexOf('> !') > -1) commandType = '!';
	else if (message.indexOf('> ?') > -1) commandType = '?';
	else return;
	commandString = message.slice(message.indexOf('> '+commandType)+2, message.length)
	user = message.slice(message.indexOf('<')+1, message.indexOf('> '+commandType))
	let ops = JSON.parse(await util.pReadFile('./ops.json', null))
	// CALL TO  COMMAND.JS
	if (await modul.getObj(ops, 'name', user)) await modul.send('command', 'processCommand', { string: commandString, minecraft: true, user: user })
}
