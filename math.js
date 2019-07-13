// Import core packages
const math = require('mathjs')

// Set defaults

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			break;
		case 'kill':
			process.exit();
			break;
		case 'pushSettings':
			break;
		case 'qm':
			console.log(message)
			var answer = math.eval(message.question).toString();
			process.send({
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: [{
							function: 'qm',
							vars: {
								question: message.question,
								answer: answer
							}
						}],
						logTo: message.logTo
					}
				}
			})
			break;
	}
});
