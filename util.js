const thisModule = 'util';

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
				name: `shutdown`,
				exeFunc: `shutdown`,
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Shutdown the server with a timer and a optional reason. ${sS.c['reset'].c}\nExample: ${sS.c['yellow'].c}~shutdown ${sS.c['orange'].c}10 ${sS.c['brightBlue'].c}Reason`,
					minecraft: [{
						"text": `Shutdown the server with a timer and a optional reason.\n`,
						"color": sS.c['brightWhite'].m
					}, {
						"text": 'Example: ',
						"color": sS.c['white'].m
					}, {
						"text": '~shutdown ',
						"color": sS.c['brightYellow'].m
					}, {
						"text": '10 ',
						"color": sS.c['yellow'].m
					}, {
						"text": 'Reason ',
						"color": sS.c['brightBlue'].m
					}],
					discord:{
						string: null,
						embed: {
							title: "Shutdown the server with a timer and a optional reason",
							description: "~shutdown",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Takes time in seconds and optional reason and makes a timer, then runs /stop when timer is done"
							}, {
								name: "Example",
								value: "**~shutdown** 10 Reason"
							}]
						}
					}
				}
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
    shutdown: async message => {
		let reason = "No reason given"
		if (message.args[1]) {
			if (message.args[2]) {
				let args = message.args
				let argsstring = args.join(" ")
				let parsedreason = argsstring.replace(args[1], "")
                reason = parsedreason.replace(args[0], "").trim()
			}
			let time = parseInt(message.args[1])
            let time2 = parseInt(message.args[1])
            let interval = setInterval(() => {
				modul.call('serverWrapper', 'serverStdin', `title @a actionbar ["",{"text":"Server restart in ${time} seconds, ${reason}","color":"dark_red","bold":true}]:"\n`)
				.catch(err => modul.lErr(err, "Sending server restart interval message failed"))
				--time
			}, 1000) // run the code in brackets every x ms
			setTimeout(() => {
				modul.call('serverWrapper', 'serverStdin', 'say RESTARTING\nstop\n')
				.catch(err => modul.lErr(err, "Sending restart message and stopping server failed"))
                clearInterval(interval)
            }, (time2*1000 + 2000)) // wait x ms then run the code in brackets
			modul.call('serverWrapper', 'serverStdin', `say Restart in ${time} seconds!\nsay Reason: ${reason}\n`)
			.catch(err => modul.lErr(err, "Sending restart headsup message failed"))
        } else {
			modul.call('serverWrapper', 'serverStdin', 'say RESTARTING\nstop\n')
			.catch(err => modul.lErr(err, "Sending restart message and stopping server failed"))
        }
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