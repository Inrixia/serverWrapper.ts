// Import core packages
const fs = require('fs');
const zlib = require('zlib');
const NbtReader = require('node-nbt').NbtReader;
const NbtWriter = require('node-nbt').NbtWriter;

const modul = require('./modul.js');
const util = require('./util.js');

const thisModule = 'nbt';

// Set defaults
let sS = {} // serverSettings
let mS = {} // moduleSettings
let crossModulePromises = {}; // Object Array of cross module promises

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			[sS, mS] = modul.init(message, thisModule)
			break;
		case 'kill':
			modul.kill(message);
			break;
		case 'pushSettings':
			[sS, mS] = modul.pushSettings(message, thisModule)
			break;
		case 'promiseResolve':
			modul.promiseResolve(message);
			break;
		case 'promiseReject':
			modul.promiseReject(message);
			break;
		case 'tpo':
			modul.send('mineapi', 'getPlayer', 'inrix', thisModule).then(data => {
				console.log(data);
			}).catch(err => util.lErr(err))
			// let executionStartTime = new Date();
			// if (message.logTo) tpo(message.args).then(args => {
			// 	process.send({
			// 		function: 'unicast',
			// 		module: 'log',
			// 		message: {
			// 			function: 'log',
			// 			logObj: {
			// 				logInfoArray: [{
			// 					function: 'tpo',
			// 					vars: {
			// 						username: args.username,
			// 						x: args.x,
			// 						y: args.y,
			// 						z: args.z,
			// 						executionStartTime: executionStartTime,
			// 						executionEndTime: new Date()
			// 					}
			// 				}],
			// 				logTo: message.logTo
			// 			}
			// 		}
			// 	});
			// }).catch(err => {
			// 	if (message.logTo) process.send({
			// 		function: 'unicast',
			// 		module: 'log',
			// 		message: {
			// 			function: 'log',
			// 			logObj: {
			// 				logInfoArray: [{
			// 					function: 'error',
			// 					vars: {
			// 						niceName: 'Error teleporting user!',
			// 						err: JSON.parse(JSON.stringify(err)),
			// 						executionStartTime: executionStartTime,
			// 						executionEndTime: new Date()
			// 					}
			// 				}],
			// 				logTo: message.logTo
			// 			}
			// 		}
			// 	});
			// })
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
		modul.send('mineapi', 'getPlayerNameUUIDDirty', {username: args.username}, thisModule).then(playerObj => {
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
