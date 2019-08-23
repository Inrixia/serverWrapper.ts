// Import core packages
const request = require('request');

// Set defaults
var sS = {} // serverSettings
var mS = {} // moduleSettings

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
		case 'getPlayerNameUUID':
			getPlayerNameUUID(message.data.playerObj).then(data => {
				process.send({
					function: 'unicast',
					module: message.data.returnModule,
					message: {
						function: 'promiseResolve',
						promiseID: message.data.promiseId,
						return: data 
					}
				});
			}).catch(err => {
				process.send({
					function: 'unicast',
					module: message.data.returnModule,
					message: {
						function: 'promiseReject',
						promiseID: message.data.promiseId,
						return: err
					}
				});
			})
			break;
		case 'getPlayerNameUUIDDirty':
				getPlayerNameUUID(message.data.playerObj).then(data => {
					dirtyUUID(data.uuid).then(uuid => {
						data.uuid = uuid;
						process.send({
							function: 'unicast',
							module: message.data.returnModule,
							message: {
								function: 'promiseResolve',
								promiseID: message.data.promiseId,
								return: data 
							}
						});
					});
				}).catch(err => {
					process.send({
						function: 'unicast',
						module: message.data.returnModule,
						message: {
							function: 'promiseReject',
							promiseID: message.data.promiseId,
							return: err
						}
					});
				})
				break;
	}
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
					vars: {
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

// Returns a uuid seperated by dashes
async function dirtyUUID(uuid){
	if (!uuid) return false;
	uuid = await cleanUUID(uuid);
	return uuid = [uuid.slice(0, 8), '-', uuid.slice(8, 12), '-', uuid.slice(12, 16), '-', uuid.slice(16, 20), '-', uuid.slice(20)].join('')
}

// Returns a uuid not seperated by dashes
async function cleanUUID(uuid) {
  if (!uuid) return false;
  return uuid.replace(/-/g, '');
}

// Takes in a object with name and uuid, returns a object with whatever is missing
async function getPlayerNameUUID(playerObj){
	if (!playerObj.name && playerObj.uuid) return await getUUID(playerObj.uuid, true)
	else if (playerObj.name && !playerObj.uuid) return await getUUID(playerObj.name, false)
	else {
		if (!playerObj.uuid && !playerObj.name) throw new Error('Missing Username and Player UUID');
		if (!playerObj.name) throw new Error('Missing Username');
		if (!playerObj.uuid) throw new Error('Missing UUID');
	}
}

function getUUID(username, uuid) {
	return new Promise(function (resolve, reject) {
		if (username) url = 'https://api.mojang.com/users/profiles/minecraft/'+username
		else url = 'https://api.mojang.com/user/profiles/'+uuid+'/names'
		request.get({
			url: url,
			json: true,
		}, (err, res, data) => {
			if (err) throw new Error(err);
			if (uuid) resolve({name: data[data.length-1].name, uuid: data.id})
			resolve({name: data.name, uuid: data.id})
		})
	})
}