let crossModulePromises = {};

module.exports.init = (message, moduleName) => {
	return [message.sS, message.sS.modules[moduleName].settings]
}
module.exports.pushSettings = (message, moduleName) => {
	return [message.sS, message.sS.modules[moduleName].settings]
}
module.exports.kill = (message) => {
	process.exit();
}

module.exports.pSend = function pSend(dstProcess, message) {
	return new Promise((resolve, reject) => {
		dstProcess.send(message, (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	})
}

module.exports.promiseResolve = function promiseResolve(message) {
	if (crossModulePromises[message.promiseID] == undefined) console.log(`\u001b[91;1mERROR: \u001b[0mAttempting to resolve undefined promise with message`, message)
	else {
		crossModulePromises[message.promiseID].resolve(message.return);
		delete crossModulePromises[message.promiseID];
	}
}

module.exports.promiseReject = function promiseReject(message) {
	if (crossModulePromises[message.promiseID] == undefined) console.log(`\u001b[91;1mERROR: \u001b[0mAttempting to reject undefined promise with message`, message)
	else {
		crossModulePromises[message.promiseID].reject(message.return);
		delete crossModulePromises[message.promiseID];
	}
}

module.exports.send = (destModule, func, data, returnModule) => {
	let externalPromiseId = Math.random();
	let externalPromise = {};
	let promise = new Promise((resolve, reject) => {
		externalPromise.resolve = resolve;
		externalPromise.reject = reject;
	});
	crossModulePromises[externalPromiseId] = externalPromise;
	if (destModule != 'serverWrapper') this.pSend(process, {
		function: 'unicast',
		module: destModule,
		message: {
			function: 'execute',
			func: func,
			returnModule: returnModule,
			promiseId: externalPromiseId,
			data: data
		}
	})
	else this.pSend(process, {
		function: 'execute',
		func: func,
		returnModule: returnModule,
		promiseId: externalPromiseId,
		data: data
	})
	return promise;
}

module.exports.resolve = (data, promiseId, returnModule) => {
	this.pSend(process, {
		function: 'unicast',
		module: returnModule,
		message: {
			function: 'promiseResolve',
			promiseID: promiseId,
			return: data
		}
	}).catch(err => {
		this.lErr(err, `Failed to resolve promise ${promiseId}, to module ${returnModule}`)
	})
}

module.exports.reject = (data, promiseId, returnModule) => {
	this.pSend(process, {
		function: 'unicast',
		module: returnModule,
		message: {
			function: 'promiseReject',
			promiseID: promiseId,
			return: data
		}
	}).catch(err => {
		this.lErr(err, `Failed to reject promise ${promiseId}, to module ${returnModule}`)
	});
}

module.exports.logg = async function logg(logObj, logTo=null) {
	logTo = {
		console: (logTo||{}).console||true,
		discord: (logTo||{}).discord||false,
		minecraft: (logTo||{}).minecraft||false
	}
	if (logTo.console && logObj.console) process.stdout.write(logObj.console+'\n');
	if (logTo.minecraft && logObj.minecraft) await this.send('serverWrapper', 'serverStdin', { string: logObj.minecraft }, this.whatsMyParentsName());
	if (logTo.discord && logObj.discord) await this.send('discord', 'discordStdin', { msg: logObj.discord, channel: logTo.discord.channel||null }, this.whatsMyParentsName())
	return true;
}

module.exports.lErr = async function lErr(err, name='', logTo=null) {
	return await this.logg({
		console: `${name?`\u001b[91;1m${name}\u001b[0m`:''} ${err.message}\n${err.stack}`,
		minecraft: `tellraw ${logTo||{}.user} ${JSON.stringify(
			[{
				"text": `${name||''}\n`,
				"color": 'red'
			}, {
				"text": `${err.message}\n${err.stack}`,
				"color": "white"
			}]
		)}\n`,
		discord: {
			string: null,
			embed: {
				color: parseInt(800000, 16),
				title: `${name ? `${name} ` : ''}${err.message}`,
				description: err.stack,
				timestamp: new Date()
			}
		}
	}, logTo).catch(err => console.log(`\u001b[91;1mError logging Error! Look... Shits real fucked if your this deep in errors\u001b[0m ${err.message}\n${err.stack}`))
}

module.exports.saveSettings = async function saveSettings(logTo, thisModuleName, serverSettings) {
	serverSettings.modules[thisModuleName].settings = mS;
	return await this.pSend(process, { function: 'saveSettings', sS: serverSettings, logTo: logTo })
}

module.exports.getObj = async function getObj(parentObject, childObjectProperty, childObjectValue) {
	return await parentObject.find((childObject) => { return childObject[childObjectProperty] === childObjectValue; })
}

module.exports.whatsMyParentsName = function whatsMyParentsName() {
	let fileName = module.parent.filename;
	return fileName.slice(fileName.lastIndexOf('/')+1, fileName.indexOf('.'));
}

if (!('toJSON' in Error.prototype))
Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        var alt = {};
        Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key];
        }, this);
        return alt;
    },
    configurable: true,
    writable: true
});