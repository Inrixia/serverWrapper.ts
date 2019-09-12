const thisModule = 'math';

// Import core packages
const math = require('mathjs')
const modul = new [require('./modul.js')][0](thisModule);
const util = require("./util/time.js")

let commands = []

// Set defaults
var sS = {} // serverSettings
var mS = {} // moduleSettings

let fn = {
	init: async message => {
		[sS, mS] = modul.loadSettings(message)
		fn.qm = async (message) => {
			let question = message.args.slice(1, message.args.length).join(' ');
			let answer = math.evaluate(question).toString()
			return {
				console: `${sS.c['white'].c}${question}'s ${sS.c['yellow'].c}=> ${sS.c['brightCyan'].c}${answer} ${sS.c['reset'].c}`,
				minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
					[{
						"text": question,
						"color": "white"
					}, {
						"text": " => ",
						"color": "gold"
					}, {
						"text": answer,
						"color": "aqua"
					}]
				)}\n`,
				discord : {
					string: null,
					embed: {
						color: parseInt(sS.c[sS.modules['nbt'].discordColor||sS.modules['nbt'].color].h, 16),
						title: `${question} => ${answer}`,
						description: null,
						timestamp: new Date()
					}
				}
			}
		}
		modul.event.on('fetchCommands', () => {
			modul.emit('exportCommands', [{
				name: 'qm',
				exeFunc: 'qm',
				module: thisModule,
				description: {
					summary: `Accepts any math question and/or unit conversion.`,
					console: `Accepts any math question and/or unit conversion. ${sS.c['white'].c}\nExamples:\n${sS.c['yellow'].c}~qm ${sS.c['cyan'].c}1 + 1\n${sS.c['yellow'].c}~qm ${sS.c['cyan'].c}1.2inch to cm\n${sS.c['yellow'].c}~qm ${sS.c['cyan'].c}1.2 * (2 + 4.5)\n${sS.c['yellow'].c}~qm ${sS.c['cyan'].c}sin(45 deg) ^ 2\n${sS.c['yellow'].c}~qm ${sS.c['cyan'].c}9 / 3 + 2i\n${sS.c['yellow'].c}~qm ${sS.c['cyan'].c}det([-1, 2; 3, 1])${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Accepts any math question and/or unit conversion.\n`,
						"color": sS.c['white'].m
					}, {
						"text": `Examples:\n`,
						"color": sS.c['brightWhite'].m
					}, {
						"text": `~qm `,
						"color": sS.c['yellow'].m
					}, {
						"text": `1+1\n`,
						"color": sS.c['cyan'].m
					}, {
						"text": `~qm `,
						"color": sS.c['yellow'].m
					}, {
						"text": `1cm to inch\n`,
						"color": sS.c['cyan'].m
					}, {
						"text": `~qm `,
						"color": sS.c['yellow'].m
					}, {
						"text": `1.2 * (2 + 4.5)\n`,
						"color": sS.c['cyan'].m
					}, {
						"text": `~qm `,
						"color": sS.c['yellow'].m
					}, {
						"text": `sin(45 deg) ^ 2\n`,
						"color": sS.c['cyan'].m
					}, {
						"text": `~qm `,
						"color": sS.c['yellow'].m
					}, {
						"text": `9 / 3 + 2i\n`,
						"color": sS.c['cyan'].m
					}, {
						"text": `~qm `,
						"color": sS.c['yellow'].m
					}, {
						"text": `det([-1, 2; 3, 1])\n`,
						"color": sS.c['cyan'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Quick Math",
							description: "~qm",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Accepts any math question and/or unit conversion. For more info see https://mathjs.org/"
							}, {
								name: "Examples:",
								value: "**~qm** 1 + 1\n**~qm** 1.2inch to cm\n**~qm** 1.2 * (2 + 4.5)\n**~qm** sin(45 deg) ^ 2\n**~qm** 9 / 3 + 2i\n**~qm** det([-1, 2; 3, 1])"
							}]
						}
					}
				}
			}])
		})
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