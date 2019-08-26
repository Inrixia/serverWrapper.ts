// Import core packages
const math = require('mathjs')
const modul = require("./modul.js")

const thisModule = 'math';
const fn = {
	qm: async (message) => {
		return math.evaluate(message.args.slice(1, message.args.length).join(' ')).toString()
	}
}

// Set defaults
var sS = {} // serverSettings
var mS = {} // moduleSettings

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'kill':
			modul.kill(message);
			break;
		case 'promiseResolve':
			modul.promiseResolve(message);
			break;
		case 'promiseReject':
			modul.promiseReject(message);
			break;
		case 'execute':
			fn[message.func](message.data)
			.then(data => modul.resolve(data, message.promiseId, message.returnModule))
			.catch(err => modul.reject(err, message.promiseId, message.returnModule))
			break;
		case 'init':
				[sS, mS] = modul.init(message, thisModule)
				modul.send('command', 'importCommands', [
					{
						name: 'qm',
						exeFunc: 'qm',
						module: 'math',
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
					}
				], thisModule)
				.catch(err => lErr(err, `Command module failed to import modules for ${thisModule}`))
				break;
	}
});
