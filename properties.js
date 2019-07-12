// Import core packages 
const properties = require('properties');

// Set defaults
var sS = {}; // serverSettings
var sP = {}; // ServerProperties

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			properties.parse('./server.properties', {path: true}, function(err, properties) {
				message.sS.modules['properties'].settings.p = properties;
				sP = properties;
				sS = message.sS;
				saveSettings();
			});
			break;
		case 'kill':
			process.exit();
			break;
		case 'pushSettings':
			sS = message.sS;
			break;
		case 'getProperty':
			var executionStartTime = new Date();
			if (sP[message.property] && message.logTo) process.send({
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: [{
							function: 'getProperty',
							vars: {
								propertyValue: sP[message.property],
								property: message.property,
								executionStartTime: executionStartTime,
								executionEndTime: new Date()
							}
						}],
						logTo: message.logTo
					}
				}
			})
			else if (message.logTo) process.send({
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: [{
							function: 'getProperty_undefined',
							vars: {
								property: message.property,
								executionStartTime: executionStartTime,
								executionEndTime: new Date()
							}
						}],
						logTo: message.logTo
					}
				}
			})
			break;
		case 'getProperties':
			var executionStartTime = new Date();
			if (message.logTo) process.send({
				function: 'unicast',
				module: 'log',
				message: {
					function: 'log',
					logObj: {
						logInfoArray: [{
							function: 'getProperties',
							vars: {
								properties: sP,
								executionStartTime: executionStartTime,
								executionEndTime: new Date()
							}
						}],
						logTo: message.logTo
					}
				}
			})
	}
});

function saveSettings(logTo) {
	process.send({ function: 'saveSettings', sS: sS, logTo: logTo })
}
