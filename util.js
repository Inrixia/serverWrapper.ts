const children = require('child_process');
const request = require('request');

/*
/ Util Functions
*/

module.exports.log = async function log(logObj, logTo=null) {
	return await this.pSend(process, {
		function: 'unicast',
		module: 'log',
		message: {
			function: 'log',
			logObj: logObj,
			logTo: logTo
		}
	}).catch(err => {throw err});
}

module.exports.pExec = async function pExec(args) {
	return new Promise((resolve, reject) => {
		children.exec(args, (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	})
}

module.exports.pRequestGet = async function pRequestGet(requestObj) {
	return new Promise((resolve, reject) => {
		request.get(requestObj, (err, res, data) => {
			if (err) reject(err);
			resolve(data);
		})
	})
}

module.exports.lErr = async function lErr(err, name='', logTo=null) {
	console.log(`${sS.c['brightRed'].c}ERROR: ${sS.c['reset'].c}${name ? `${name}` : ''}${err.message}\n${err.stack}`,)
	if (logTo) return await this.pSend(process, {
		function: 'unicast',
		module: 'log',
		message: {
			function: 'log',
			logObj: {
				logInfoArray: [{
					function: 'error',
					vars: {
						niceName: name,
						err: err,
						from: require.main.filename
					}
				}]
			},
			logTo: logTo
		}
	}).catch(err => {throw err});
	else return;
}


module.exports.debug = async function debug(stringOut) {
	try {
		if (typeof stringOut === 'string') process.stdout.write(`\n\u001b[41mDEBUG>\u001b[0m ${stringOut}\n\n`)
		else {
			process.stdout.write(`\n\u001b[41mDEBUG>\u001b[0m`);
			console.log(stringOut);
		}
	} catch (e) {
		process.stdout.write(`\n\u001b[41mDEBUG>\u001b[0m ${stringOut}\n\n`);
	}
}

module.exports.saveSettings = async function saveSettings(logTo, thisModuleName, serverSettings) {
	serverSettings.modules[thisModuleName].settings = mS;
	return await this.pSend(process, { function: 'saveSettings', sS: serverSettings, logTo: logTo })
	.catch(err => {throw err})
}

module.exports.pSend = async function pSend(dstProcess, message) {
	return new Promise((resolve, reject) => {
		dstProcess.send(message, (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	})
}

if (!('toJSON' in Error.prototype))
Object.defineProperty(Error.prototype, 'toJSON', {
    value: () => {
        let alt = {};
        Object.getOwnPropertyNames(this).forEach((key) => {
            alt[key] = this[key];
        }, this);
        return alt;
    },
    configurable: true,
    writable: true
});

module.exports.getObj = async function getObj(parentObject, childObjectProperty, childObjectValue) {
	return await parentObject.find((childObject) => { return childObject[childObjectProperty] === childObjectValue; })
}