class EventEmitter extends require('events') {
    emit(type, ...args) {
		super.emit(type, ...args)
		if (args[args.length-1] != true) module.exports.pSend(process, { function: 'event', event: type, args: args })
    }
}

module.exports = class Module {
	constructor(thisModule) {
		this.thisModule = thisModule;
		this.crossModulePromises = {};
		this._event = new EventEmitter();
		this._event.on('newListener', (event, listener) => {
			Module.pSend(process, { function: 'eventSub', event: event })
		});
		process.on('disconnect', () => process.exit());
		process.on('message', message => {
			switch (message.function) {
				case 'event':
					((...args) => this._event.emit(...args)).apply(null, [message.event].concat(message.args, [true]))
					break;
				case 'promiseResolve':
					this.promiseResolve(message);
					break;
				case 'promiseReject':
					this.promiseReject(message);
					break;
				case 'kill':
					process.exit();
					break;
			}
		})
	}
	delay(time) {
		return new Promise(resolve => setTimeout(() => resolve(), time))
	}
	get event() { return this._event }
	emit(...args) { this._event.emit(...args) }
	loadSettings(message, moduleName=this.thisModule) {
		return [message.sS, message.sS.modules[moduleName].settings]
	}
	static pSend(dstProcess, message) {
		return new Promise((resolve, reject) => {
			dstProcess.send(message, (err, data) => {
				if (err) reject(err);
				resolve(data);
			});
		})
	}
	promiseResolve(message) {
		if (this.crossModulePromises[message.promiseID] == undefined) {
			if (this.moduleName) console.log(`\u001b[91;1mERROR: \u001b[0mAttempting to resolve undefined promise in ${this.moduleName} with message`, message)
		} else {
			this.crossModulePromises[message.promiseID].resolve(message.return);
			delete this.crossModulePromises[message.promiseID];
		}
	}
	promiseReject(message) {
		if (this.crossModulePromises[message.promiseID] == undefined) {
			if (this.moduleName) console.log(`\u001b[91;1mERROR: \u001b[0mAttempting to reject undefined promise in ${this.moduleName} with message`, message)
		} else {
			this.crossModulePromises[message.promiseID].reject(message.return);
			delete this.crossModulePromises[message.promiseID];
		}
	}
	call(destModule, func, data, returnModule=this.thisModule) {
		let externalPromiseId = Math.random();
		let externalPromise = {};
		let promise = new Promise((resolve, reject) => {
			externalPromise.resolve = resolve;
			externalPromise.reject = reject;
		});
		this.crossModulePromises[externalPromiseId] = externalPromise;
		if (destModule != 'serverWrapper') Module.pSend(process, {
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
		else Module.pSend(process, {
			function: 'execute',
			func: func,
			returnModule: returnModule,
			promiseId: externalPromiseId,
			data: data
		})
		return promise;
	}
	resolve(data, promiseId, returnModule) {
		if (returnModule != 'serverWrapper') Module.pSend(process, {
			function: 'unicast',
			module: returnModule,
			message: {
				function: 'promiseResolve',
				promiseID: promiseId,
				return: data
			}
		}).catch(err => {
			this.lErr(err, `Failed to resolve promise ${promiseId}, to module ${returnModule} in ${this.moduleName}`)
		})
		else Module.pSend(process, {
			function: 'promiseResolve',
			promiseID: promiseId,
			return: data
		}).catch(err => {
			this.lErr(err, `Failed to resolve promise ${promiseId}, to module ${returnModule}in ${this.moduleName}`)
		})
	}
	reject(data, promiseId, returnModule) {
		if (returnModule != 'serverWrapper') Module.pSend(process, {
			function: 'unicast',
			module: returnModule,
			message: {
				function: 'promiseReject',
				promiseID: promiseId,
				return: data
			}
		}).catch(err => {
			this.lErr(err, `Failed to reject promise ${promiseId}, to module ${returnModule} in ${this.moduleName}`)
		})
		else Module.pSend(process, {
			function: 'promiseReject',
			promiseID: promiseId,
			return: data
		}).catch(err => {
			this.lErr(err, `Failed to reject promise ${promiseId}, to module ${returnModule}in ${this.moduleName}`)
		});
	}
	async logg(logObj, logTo=null) {
		logTo = {
			console: (logTo||{}).console||true,
			discord: (logTo||{}).discord||false,
			server: (logTo||{}).server||false
		}
		if (logTo.console && logObj.console) process.stdout.write(logObj.console+'\n');
		if (logTo.server && logObj.server) await this.call('serverWrapper', 'serverStdin', logObj.server);
		if (logTo.discord && logObj.discord) await this.call('discord', 'discordStdin', { msg: logObj.discord, channel: logTo.discord.channel||null }, this.thisModule)
	}
	async lErr(err, name='', logTo=null) {
		return await this.logg({
			console: `${name?`\u001b[91;1m${name}\u001b[0m `:''}${err.message}\n${err.stack}`,
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
					title: `${name ? `${name} `:''}${err.message}`,
					description: err.stack,
					timestamp: new Date()
				}
			}
		}, logTo).catch(err => console.log(`\u001b[91;1mError logging Error! Found in ${this.moduleName} Look... Shits real fucked if your this deep in errors\u001b[0m ${err.message}\n${err.stack}`))
	}
	async saveSettings(serverSettings, moduleSettings, thisModuleName=this.thisModule, logTo=null) {
		serverSettings.modules[thisModuleName].settings = moduleSettings;
		return await this.call('serverWrapper', 'saveSettings', { sS: serverSettings, logTo: logTo })
	}
	async getObj(parentObject, childObjectProperty, childObjectValue) {
		return await parentObject.find((childObject) => { return childObject[childObjectProperty] === childObjectValue; })
	}
	whatsMyParentsName() {
		let fileName = module.parent.filename;
		return fileName.slice(fileName.lastIndexOf('/')+1, fileName.indexOf('.'));
	}
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