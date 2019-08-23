// Import core packages
const fs = require('fs');
const zlib = require('zlib');
const TAG = require('node-nbt').TAG;
const NbtReader = require('node-nbt').NbtReader;
const NbtWriter = require('node-nbt').NbtWriter;
const nbt = require('prismarine-nbt');

// Set defaults
let sS = {} // serverSettings
let mS = {} // moduleSettings
let crossModulePromises = {}; // Object Array of cross module promises

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			sS = message.sS;
			mS = sS.modules['nbt'].settings;
			break;
		case 'kill':
			process.exit();
			break;
		case 'pushSettings':
			sS = message.sS;
			mS = sS.modules['nbt'].settings;
			break;
		case 'promiseResolve':
			crossModulePromises[message.promiseID].resolve(message.return);
			delete crossModulePromises[message.promiseID];
			break;
		case 'promiseReject':
			crossModulePromises[message.promiseID].reject(message.return);
			delete crossModulePromises[message.promiseID];
			break;
		case 'tpo':
			let executionStartTime = new Date();
			if (message.logTo) tpo(message.args).then(args => {
				process.send({
					function: 'unicast',
					module: 'log',
					message: {
						function: 'log',
						logObj: {
							logInfoArray: [{
								function: 'tpo',
								vars: {
									username: args.username,
									x: args.x,
									y: args.y,
									z: args.z,
									executionStartTime: executionStartTime,
									executionEndTime: new Date()
								}
							}],
							logTo: message.logTo
						}
					}
				});
			}).catch(err => {
				if (message.logTo) process.send({
					function: 'unicast',
					module: 'log',
					message: {
						function: 'log',
						logObj: {
							logInfoArray: [{
								function: 'error',
								vars: {
									niceName: 'Error teleporting user!',
									err: JSON.parse(JSON.stringify(err)),
									executionStartTime: executionStartTime,
									executionEndTime: new Date()
								}
							}],
							logTo: message.logTo
						}
					}
				});
			})
			break;
		case 'getSpawn':
			executionStartTime = new Date();
			if (message.logTo) getSpawn().then(worldSpawn => {
				process.send({
					function: 'unicast',
					module: 'log',
					message: {
						function: 'log',
						logObj: {
							logInfoArray: [{
								function: 'getSpawn',
								vars: {
									worldSpawn: worldSpawn,
									executionStartTime: executionStartTime,
									executionEndTime: new Date()
								}
							}],
							logTo: message.logTo
						}
					}
				});
			}).catch(err => {
				if (message.logTo) process.send({
					function: 'unicast',
					module: 'log',
					message: {
						function: 'log',
						logObj: {
							logInfoArray: [{
								function: 'error',
								lets: {
									niceName: 'Error fetching worldSpawn!',
									err: JSON.parse(JSON.stringify(err)),
									executionStartTime: executionStartTime,
									executionEndTime: new Date()
								}
							}],
							logTo: message.logTo
						}
					}
				});
			})
		break;
	}
});

function tpo(args) {
	return new Promise((resolve, reject) => {
		let externalPromiseId = Math.random();
		let externalPromise = {};
		let UUIDPromise = new Promise((resolve, reject) => {
			externalPromise.resolve = resolve;
			externalPromise.reject = reject;
		});
		crossModulePromises[externalPromiseId] = externalPromise;
		process.send({
			function: 'unicast',
			module: 'mineapi',
			message: {
				function: 'getPlayerNameUUIDDirty',
				data: {
					returnModule: 'nbt',
					playerObj: {name: args.username},
					promiseId: externalPromiseId
				}
			}
		});
		UUIDPromise.then(playerObj => {
			// TODO replace serverWorldFolder with dynamic generated
			let serverWorldFolder = sS.modules['properties'].settings.p['level-name'] ? sS.modules['properties'].settings.p['level-name'] : 'Cookies';
			fs.readFile(serverWorldFolder+`/playerdata/${playerObj.uuid}.dat`, (err, data) => {
				if (err) reject(err);
				else zlib.gunzip(data, (err, buffer) => {
					if (err) reject(err);
					let playerData = NbtReader.readTag(buffer);
					let playerPosIndex = playerData.val.indexOf(getObj(playerData.val, 'name', 'Pos'));
					playerData.val[playerPosIndex].val.list[0].val = args.x;
					playerData.val[playerPosIndex].val.list[1].val = args.y;
					playerData.val[playerPosIndex].val.list[2].val = args.z;
					zlib.gzip(NbtWriter.writeTag(playerData), (err, playerDataBuffer) => {
						fs.writeFile(serverWorldFolder+`/playerdata/${playerObj.uuid}.dat`, playerDataBuffer, (err, data) => {
							if (err) reject(err);
							resolve(args);
						})
					})
				});
			});
		}).catch(err => logError)
	})
}

async function getSpawn() {
	return new Promise(function(resolve, reject){
		let serverWorldFolder = sS.modules['properties'].settings.p['level-name'] ? sS.modules['properties'].settings.p['level-name'] : 'Cookies';
		fs.readFile(serverWorldFolder+'/level.dat', function(err, data) {
			if (err) reject(err);
		  	else zlib.gunzip(data, function(err, buffer) {
				if (err) throw new Error(err);
				let levelData = getObj(NbtReader.readTag(buffer).val, 'name', 'Data');
				let worldSpawn = {};
				worldSpawn.x = getObj(levelData.val, 'name', 'SpawnX').val;
				worldSpawn.y = getObj(levelData.val, 'name', 'SpawnY').val;
				worldSpawn.z = getObj(levelData.val, 'name', 'SpawnZ').val;
				return worldSpawn;
		  	});
		});
	})
}

/*
/ Util Functions
*/

function getObj(parentObject, childObjectProperty, childObjectValue) {
	return parentObject.find((childObject) => { return childObject[childObjectProperty] === childObjectValue; })
}

function debug(stringOut) {
	try {
		if (typeof stringOut === 'string') process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset'].c} ${stringOut}\n\n`)
		else {
			process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset'].c}`);
			console.log(stringOut);
		}
	} catch (e) {
		process.stdout.write(`\n\u001b[41mDEBUG>${sS.c['reset'].c} ${stringOut}\n\n`);
	}
}

if (!('toJSON' in Error.prototype))
Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        let alt = {};

        Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key];
        }, this);

        return alt;
    },
    configurable: true,
    writable: true
});

function logError(err, name='') {
	process.send({
		function: 'unicast',
		module: 'log',
		message: {
			function: 'log',
			logObj: {
				logInfoArray: [{
					function: 'error',
					lets: {
						niceName: name,
						err: {
							message: err.message,
							stack: err.stack
						}
					}
				}]
			}
		}
	});
}
