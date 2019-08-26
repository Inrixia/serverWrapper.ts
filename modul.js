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

module.exports.pSend = function pSend(dstProcess, message) {
	return new Promise((resolve, reject) => {
		dstProcess.send(message, (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	})
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