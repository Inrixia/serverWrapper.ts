const thisModule = 'auth';

// Import core packages
const modul = new [require('./modul.js')][0](thisModule)
const util = require('./util/fs.js');

// Set defaults
var sS = {} // serverSettings
var mS = {} // moduleSettings

const fn = {
	init: async message => {
		[sS, mS] = modul.loadSettings(message)
		modul.event.on('serverStdout', message => processServerMessage(message).catch(err => modul.lErr(err, null, message.logTo)))
		modul.event.on('discordMessage', message => processDiscordMessage(message).catch(err => modul.lErr(err, null, message.logTo)))
		modul.event.on('fetchCommands', () => {
			modul.emit('exportCommands', [{
				name: 'cwAdd', 
				exeFunc: 'commandWhitelistAdd',
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Adds given whitelisted command to a discord role or user. ${sS.c['reset'].c}\nExamples  [Discord Only]:\n${sS.c['yellow'].c}~cwAdd ${sS.c['brightBlue'].c}~listmodules ${sS.c['orange'].c}@DiscordUser ${sS.c['cyan'].c}1 hour\n${sS.c['reset'].c}${sS.c['yellow'].c}~cwAdd ${sS.c['brightBlue'].c}!forge tps ${sS.c['orange'].c}@DiscordUser\n${sS.c['reset'].c}${sS.c['yellow'].c}~cwAdd ${sS.c['brightBlue'].c}!tp ${sS.c['orange'].c}@DiscordRole ${sS.c['cyan'].c}5.2 minutes\n${sS.c['reset'].c}${sS.c['yellow'].c}~cwAdd ${sS.c['brightBlue'].c}~getSpawn ${sS.c['orange'].c}@DiscordRole${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Adds given whitelisted command to a discord role or user. For a specific time if given, otherwise infinite.\n`,
						"color": sS.c['brightWhite'].m
					}, {
						"text": `Examples [Discord Only]:\n`,
						"color": sS.c['white'].m
					}, {
						"text": `~cwAdd `,
						"color": sS.c['yellow'].m
					}, {
						"text": `~listmodules `,
						"color": sS.c['brightBlue'].m
					}, {
						"text": `@DiscordUser `,
						"color": sS.c['brightRed'].m
					}, {
						"text": `1 hour\n`,
						"color": sS.c['cyan'].m
					}, {
						"text": `~cwAdd `,
						"color": sS.c['yellow'].m
					}, {
						"text": `"!forge tps" `,
						"color": sS.c['brightBlue'].m
					}, {
						"text": `@DiscordUser\n`,
						"color": sS.c['brightRed'].m
					}, {
						"text": `~cwAdd `,
						"color": sS.c['yellow'].m
					}, {
						"text": `!tp `,
						"color": sS.c['brightBlue'].m
					}, {
						"text": `@DiscordRole `,
						"color": sS.c['brightRed'].m
					}, {
						"text": `5.2 minutes\n`,
						"color": sS.c['cyan'].m
					}, {
						"text": `~cwAdd `,
						"color": sS.c['yellow'].m
					}, {
						"text": `~getSpawn `,
						"color": sS.c['brightBlue'].m
					}, {
						"text": `@DiscordRole `,
						"color": sS.c['brightRed'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Command Whitelist Remove",
							description: "~cwRemove",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Adds given whitelisted command to a discord role or user. \nIf a time is specified the user/role will have access to the command for that duration. Otherwise the permission is given with no expiry."
							}, {
								name: "Examples [Discord Only]:",
								value: `**~cwAdd** ~listModules @DiscordUser 1 hour\n**~cwAdd** "forge tps" @DiscordUser\n**~cwAdd** !tp @DiscordRole 5.2 minutes\n**~cwAdd** ~getSpawn @DiscordRole`
							}]
						}
					}
				}
			}, {
				name: 'cwRemove', 
				exeFunc: 'commandWhitelistRemove',
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Removes given whitelisted commands from a discord role or user. ${sS.c['reset'].c}\nExamples:\n${sS.c['yellow'].c}~cw_remove ${sS.c['brightBlue'].c}@DiscordUser ${sS.c['brightWhite'].c}\n${sS.c['yellow'].c}~cw_remove ${sS.c['brightBlue'].c}@DiscordRole${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Removes given whitelisted commands from a discord role or user.\n`,
						"color": sS.c['brightWhite'].m
					}, {
						"text": `Examples:\n`,
						"color": sS.c['white'].m
					}, {
						"text": `~cw_remove `,
						"color": sS.c['yellow'].m
					}, {
						"text": `@DiscordUser\n`,
						"color": sS.c['brightBlue'].m
					}, {
						"text": `~cw_remove `,
						"color": sS.c['yellow'].m
					}, {
						"text": `@DiscordUser`,
						"color": sS.c['brightBlue'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Command Whitelist Remove",
							description: "~cwRemove",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Removes given whitelisted commands from a discord role or user."
							}, {
								name: "Example",
								value: "**~cw_remove** @DiscordUser\n**~cw_remove** @DiscordRole"
							}]
						}
					}
				}
			}, {
				name: 'cwRemove',
				exeFunc: 'commandWhitelistRemove',
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Removes all whitelisted commands from a discord role or user. ${sS.c['reset'].c}\nExample: ${sS.c['yellow'].c}~cwRemove ${sS.c['brightBlue'].c}@DiscordUser\n${sS.c['yellow'].c}~cwRemove ${sS.c['brightBlue'].c}@DiscordRole${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Removes all whitelisted commands from a discord role or user.\n`,
						"color": sS.c['brightWhite'].m
					}, {
					"text": `Examples:\n`,
					"color": sS.c['white'].m
					}, {
					"text": `~cwRemove `,
					"color": sS.c['yellow'].m
						}, {
							"text": `@DiscordUser\n`,
							"color": sS.c['brightBlue'].m
					}, {
					"text": `~cwRemove `,
					"color": sS.c['yellow'].m
						}, {
							"text": `@DiscordUser`,
							"color": sS.c['brightBlue'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Command Whitelist Remove-All",
							description: "~cwRemove",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Removes all whitelisted commands from a discord role or user."
							}, {
								name: "Examples",
								value: "**~cwRemove** @DiscordUser\n**~cwRemove** @DiscordRole"
							}]
						}
					}
				}
			}])
		})
	},
	commandWhitelistAdd: async message => {
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
		// cwAdd: function(vars) {
		// 	console.log(vars)
		// 	return [{
		// 		discord : {
		// 			string: null,
		// 			embed: {
		// 				color: parseInt(sS.c[sS.modules['command'].discordColor||sS.modules['command'].color].h, 16),
		// 				title: `Whitelisted command ${vars.args[1]} for @${(vars.cr.wo.Username) ? vars.cr.wo.Username : vars.cr.wo.Name}`,
		// 				description: `Expires in ${moment(vars.cr.expiresin).fromNow(true)}`,
		// 				timestamp: new Date(),
		// 				footer: {
		// 					text: `Executed in ${util.getDuration(message.exeStart, new Date())}`
		// 				}
		// 			}
		// 		},
		// 		console: `Whitelisted command ${sS.c['cyan'].c}${vars.args[1]}${sS.c['reset'].c} for ${sS.c['brightBlue'].c}${(vars.cr.wo.Username) ? vars.cr.wo.Username : vars.cr.wo.Name}${sS.c['reset'].c} ${sS.c['yellow'].c}${(vars.args[3]) ? `Expires in ${moment(vars.cr.expiresin).fromNow(true)}` : ''}${sS.c['reset'].c}`
		// 	}]
		// }
	},	
	commandWhitelistRemove: async message => {
		if (message.args[0] == "~cwRemove") {
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
		// cwRemove: function(vars) {
		// 	return [{
		// 		discord: { string: `Removed all commands from **${(vars.whitelisted_object.Username) ? vars.whitelisted_object.Username : vars.whitelisted_object.Name}**`, embed: null }
		// 	}]
		// },
	
		// cw_remove: function(vars) {
		// 	return [{
		// 		discord: { string: `Removed command **${vars.args[1]}** from **${(vars.whitelisted_object.Username) ? vars.whitelisted_object.Username : vars.whitelisted_object.Name}**`, embed: null }
		// 	}]
		// },
	}
}

// Module command handling
process.on('message', async message => {
	switch (message.function) {
		case 'execute':
			if (!(message.func in fn)) modul.reject(new Error(`Command "${message.func}" does not exist in module "${thisModule}"`), message.promiseId, message.returnModule)
			else fn[message.func](message.data)
			.then(data => modul.resolve(data, message.promiseId, message.returnModule))
			.catch(err => modul.reject(err, message.promiseId, message.returnModule))
			break;
		case 'pushSettings':
			[sS, mS] = modul.loadSettings(message)
			break;
	}
});

async function checkCommandAuth(allowedCommands, message) {
	let authErr = false;
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
				authErr = true;
				await modul.saveSettings(sS, mS)
			}
		}
	};
	//if (authErr) throw new Error('User not allowed to run this command.');
	if (authErr) modul.lErr(new Error('User not allowed to run this command.'))
}


async function checkDiscordAuth(message) {
	let authErr = false
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
	authErr = true;
	//if (authErr) throw new Error('User not whitelisted.');
	if (authErr) modul.lErr(new Error('User not whitelisted'))
}

async function processDiscordMessage(message) {
	// "Mod" role id: 344286675691896832
	// "Admin" role id: 278046497789181954
	if ((message.string[0] == '~' || message.string[0] == '!' || message.string[0] == '?') && await checkDiscordAuth(message)) { // User is allowed to run this command
		process.stdout.write(`[${sS.c['brightCyan'].c}${message.author.username}${sS.c['reset'].c}]: ${message.string.trim()}\n`);
		if (message.string[0] == '~' || message.string[0] == '?') await modul.call('command', 'processCommand', message)
		else if (message.string[0] == '!') {
			await modul.call('discord', 'addTempManagementChannel', message.channel.id)
			await modul.call('serverWrapper', 'serverStdin', message.string.slice(1,message.length).trim()+'\n') // Message is a serverCommand
		}
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
	// CALL TO COMMAND.JS
	if (await modul.getObj(ops, 'name', user)) await modul.call('command', 'processCommand', { string: commandString, minecraft: true, user: user })
}
