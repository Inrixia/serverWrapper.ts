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
	crossModulePromises[message.promiseID].resolve(message.return);
	delete crossModulePromises[message.promiseID];
}

module.exports.promiseReject = function promiseReject(message) {
	crossModulePromises[message.promiseID].reject(message.return);
	delete crossModulePromises[message.promiseID];
}

module.exports.send = (destModule, func, data, returnModule) => {
	let externalPromiseId = Math.random();
	let externalPromise = {};
	let promise = new Promise((resolve, reject) => {
		externalPromise.resolve = resolve;
		externalPromise.reject = reject;
	});
	crossModulePromises[externalPromiseId] = externalPromise;
	if (destModule != 'serverWrapper') this.pSend({
		function: 'unicast',
		module: destModule,
		message: {
			function: 'execute',
			func: func,
			returnModule: returnModule,
			promiseId: externalPromiseId,
			data: data
		}
	}).catch(err => {throw err});
	else this.pSend({
		function: 'execute',
		func: func,
		returnModule: returnModule,
		promiseId: externalPromiseId,
		data: data
	}).catch(err => {throw err});
	return promise;
}

module.exports.resolve = (data, promiseId, returnModule) => {
	pSend(process, {
		function: 'unicast',
		module: returnModule,
		message: {
			function: 'promiseResolve',
			promiseID: promiseId,
			return: data
		}
	}).cath(err => this.lErr(err, `Failed to resolve promise ${promiseId}, to module ${returnModule}`));
}

module.exports.reject = (data, promiseId, returnModule) => {
	pSend(process, {
		function: 'unicast',
		module: returnModule,
		message: {
			function: 'promiseReject',
			promiseID: promiseId,
			return: data
		}
	}).cath(err => this.lErr(err, `Failed to reject promise ${promiseId}, to module ${returnModule}`));
}

