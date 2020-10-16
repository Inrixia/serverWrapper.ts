const thisModule = 'util';
const ip = require('ip')
const https = require('https')
var exitIsActive = false
// Set defaults
var sS = {}; // serverSettings
let mS = {}; // ServerProperties

// Import core packages
const modul = new [require('./modul.js')][0](thisModule)
let fn = {
	init: async message => {
		[sS, mS] = modul.loadSettings(message)
		modul.event.on('fetchCommands', () => {
			modul.emit('exportCommands', [{
				name: 'tpc',
				exeFunc: 'tpc',
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Teleports player to given chunk coords. ${sS.c['reset'].c}\nExample: ${sS.c['yellow'].c}~tpc ${sS.c['orange'].c}10 ${sS.c['brightBlue'].c}10 ${sS.c['reset'].c}tp's to ${sS.c['orange'].c}160 ${sS.c['white'].c}100 ${sS.c['brightBlue'].c}160 ${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Teleports player to given chunk coords.\n`,
						"color": sS.c['brightWhite'].m
					}, {
						"text": 'Example: ',
						"color": sS.c['white'].m
					}, {
						"text": '~tpc ',
						"color": sS.c['brightYellow'].m
					}, {
						"text": '10 ',
						"color": sS.c['yellow'].m
					}, {
						"text": '10 ',
						"color": sS.c['brightBlue'].m
					}, {
						"text": "tp's to ",
						"color": sS.c['white'].m
					}, {
						"text": '160 ',
						"color": sS.c['yellow'].m
					}, {
						"text": '100 ',
						"color": sS.c['white'].m
					}, {
						"text": '160',
						"color": sS.c['brightBlue'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Teleport player to chunk coords",
							description: "~tpc",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Takes x and z coords given, multiplies them by 16 and teleports the player to that location."
							}, {
								name: "Example",
								value: "**~tpc** 10 10 teleports player to coords 160 100 160"
							}]
						}
					}
				}
			}, {
				name: 'tpr',
				exeFunc: 'tpr',
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Teleports player to given region coords. ${sS.c['reset'].c}\nExample: ${sS.c['yellow'].c}~tpr ${sS.c['orange'].c}10 ${sS.c['brightBlue'].c}10 ${sS.c['white'].c}tp's to ${sS.c['orange'].c}5120 ${sS.c['white'].c}100 ${sS.c['brightBlue'].c}5120 ${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Teleports player to given region coords.\n`,
						"color": sS.c['brightWhite'].m
					}, {
						"text": 'Example: ',
						"color": sS.c['white'].m
					}, {
						"text": '~tpr ',
						"color": sS.c['brightYellow'].m
					}, {
						"text": '10 ',
						"color": sS.c['yellow'].m
					}, {
						"text": '10 ',
						"color": sS.c['brightBlue'].m
					}, {
						"text": "tp's to ",
						"color": sS.c['white'].m
					}, {
						"text": '5120 ',
						"color": sS.c['yellow'].m
					}, {
						"text": '100 ',
						"color": sS.c['white'].m
					}, {
						"text": '5120',
						"color": sS.c['brightBlue'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Teleport player to region coords",
							description: "~tpr",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Takes x and z region coords, multiplies them by 512 and teleports the player to that location."
							}, {
								name: "Example",
								value: "**~tpr** 10 10 teleports player to coords 5,120 100 5,120"
							}]
						}
					}
				}
			}, {
				name: `exit`,
				exeFunc: `exit`,
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Exit the server with a timer and a optional reason. ${sS.c['reset'].c}\nExample: ${sS.c['yellow'].c}~exit ${sS.c['orange'].c}10 ${sS.c['brightBlue'].c}"Server restart" "applying config changes"`,
					minecraft: [{
						"text": `Exit the server with a timer and a optional reason.\n`,
						"color": sS.c['brightWhite'].m
					}, {
						"text": 'Example: ',
						"color": sS.c['white'].m
					}, {
						"text": '~exit ',
						"color": sS.c['brightYellow'].m
					}, {
						"text": '10 ',
						"color": sS.c['yellow'].m
					}, {
						"text": '"Server restart" "applying config changes" ',
						"color": sS.c['brightBlue'].m
					}],
					discord:{
						string: null,
						embed: {
							title: "Exit the server with a timer and an optional reason",
							description: "~exit",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Takes time in seconds and optional reason(s) and makes a timer, then runs /stop when timer is done"
							},
								{
								name: "Syntax",
								value: '~exit time "serverGoingTo" "serverExitReason" "serverKickReason"'
							},
								{
								name: "Example",
								value: '**~exit** 10 "Server restart" "applying config changes" "Server restart, please join when server has started'
							},
								{
								name: "Result",
								value: '**$serverGoingTo in x seconds! Reason: $serverExitReason** as title for all players, time updates every second. **$serverKickReason** is reason why players are kicked at end of countdown.'	
							}]
						}
					}
				}
			}, {
				name: 'test',
				exeFunc: 'test',
				module: thisModule,
				description: {}
			}]);
		})
    },
    tpc: async message => {
		return {
			minecraft: `tp ${message.logTo.user} ${message.args[1]*16} 100 ${message.args[2]*16}\n`
		}
	},
	tpr: async message => {
		return {
			minecraft: `tp ${message.logTo.user} ${message.args[1]*512} 100 ${message.args[2]*512}\n`
		}
    },
    exit: async message => {
		if (exitIsActive) {
			if (message.args[1]) {
				if (message.args[1].toLowerCase() !== 'cancel') {
					return {
						minecraft: `tellraw ${message.logTo.user} ["",{"text":"Exit is active, please cancel it with ~exit cancel first","color":"yellow","bold":true}]\n`,
						discord: {
							string: null,
							embed: {
								title: "Warning",
								description: "Exit is active, please cancel it with ~exit cancel first",
								color: parseInt(sS.c['yellow'].h, 16),
								timestamp: new Date()
							}
						},
						console: `${sS.c['yellow'].c}Exit is active, please cancel it with ~exit cancel first ${sS.c['reset'].c}`
					}
				}
			} else {
				return {
					minecraft: `tellraw ${message.logTo.user} ["",{"text":"Exit cancelled","color":"green","bold":true}]\n`,
					discord: {
						string: `Exit cancelled`,
						embed: {
							title: "Success",
							description: "Exit cancelled",
							color: parseInt(sS.c['green'].h, 16),
							timestamp: new Date()
						}
					},
					console: `${sS.c['green'].c}Exit cancelled ${sS.c['reset'].c}`
				}
			}
		}
		if (exitIsActive === false) {
			if (!message.args[1]) fn.kickAll('Server stopping!')
			exitIsActive = true
			if (message.args[1]) {
				if (isNaN(parseInt(message.args[1])) == false) {
					let time = parseInt(message.args[1])
					if (message.args[2]) {
						let args = message.args
						let serverGoingTo = args[2]
						let serverExitReason = args[3]
						let serverKickReason = args[4]
						if (!serverExitReason) serverExitReason = 'No reason specified'
						if (!serverKickReason) serverKickReason = 'Server stopped!'
						modul.call('serverWrapper', 'serverStdin', `say ${serverGoingTo} in ${time} seconds! Reason: ${serverExitReason}\n`)
						let interval = setInterval(() => {
							if (exitIsActive === false) {
								clearInterval(interval); 
								clearTimeout(timeout);
							}
							modul.call('serverWrapper', 'serverStdin', `title @a actionbar ["",{"text":"${serverGoingTo} in ${time} seconds, reason: ${serverExitReason}","color":"dark_red","bold":true}]:"\n`)
							.catch(err => modul.lErr(err, "Sending server restart interval message failed"))
							--time
						}, 1000) // run the code in brackets every x ms
						let timeout = setTimeout(async serverKickReason => {
							await fn.kickAll(serverKickReason)
							modul.call('serverWrapper', 'serverStdin', 'stop\n').catch(err => modul.lErr(err, "Kicking players and stopping server failed"))
						}, time*1000, serverKickReason) // refuses to run
					} else {
						let serverKickReason = 'Server stopping!';
						modul.call('serverWrapper', 'serverStdin', `say Server stopping in ${time} seconds!\n`)
						let interval = setInterval(() => {
							if (exitIsActive === false) {
								clearInterval(interval); 
								clearTimeout(timeout); 
								modul.call('serverWrapper', 'serverStdin', 'say Server exit was cancelled!\ntitle @a actionbar ["",{"text":"Server exit cancelled!","color":"dark_red","bold":true}]:"\n');
							}
							modul.call('serverWrapper', 'serverStdin', `title @a actionbar ["",{"text":"Server stopping in ${time} seconds","color":"dark_red","bold":true}]:"\n`)
							.catch(err => modul.lErr(err, "Sending server restart interval message failed"))
							--time
						}, 1000) // run the code in brackets every x ms
						let timeout = setTimeout(async serverKickReason => {
							await fn.kickAll(serverKickReason)
							modul.call('serverWrapper', 'serverStdin', 'stop\n').catch(err => modul.lErr(err, "Kicking players and stopping server failed"))
						}, time*1000, serverKickReason) // runs fine
					}
				} else {
					let serverKickReason = message.args[1]
					await fn.kickAll(serverKickReason)
					modul.call('serverWrapper', 'serverStdin', 'stop\n').catch(err => modul.lErr(err, "Kicking players and stopping server failed"))
				}
			}
		} else if (message.args[1]) {
			if (message.args[1].toLowerCase() === 'cancel') {
				exitIsActive = false; 
				return {
					minecraft: `tellraw ${message.logTo.user} ["",{"text":"Exit cancelled","color":"green","bold":true}]\n`,
					discord: {
						string: `Exit cancelled`,
						embed: {
							title: "Success",
							description: "Exit cancelled",
							color: parseInt(sS.c['green'].h, 16),
							timestamp: new Date()
						}
					},
					console: `${sS.c['green'].c}Exit cancelled ${sS.c['reset'].c}`
				}
			}
		}
	},
	kickAll: async reason => {
		let pingTable = await modul.call('properties', 'ping')
		if (pingTable.players.online !== 0) {
			await Promise.all(pingTable.players.sample.map(player => {
				return modul.call('serverWrapper', 'serverStdin', `kick ${player.name} ${reason||''}\n`)
			}))
		}
	},
	test: async message => {
		/*let [response, user] = await modul.call('discord', 'getResponse', {user: message.author.id, channel: message.channel.id, validResponses: ["NAW", "YEE", "stuff"], timeout: 6}).catch(err => modul.lErr(err))
		return {
			discord: {
				string: null,
				embed: {
					title: "it work, "+ user,
					description: response,
					color: parseInt(sS.c['green'].h, 16),
					timestamp: new Date()
				}
			}
		}*/
	}
}


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