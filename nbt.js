// Import core packages
const fs = require('fs');
const zlib = require('zlib');
const TAG = require('node-nbt').TAG;
const NbtReader = require('node-nbt').NbtReader;
const NbtWriter = require('node-nbt').NbtWriter;

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
		case 'getSpawn':
			var executionStartTime = new Date();
			getSpawn().then(worldSpawn => {
				if (message.logTo) process.send({
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
								vars: {
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

function getSpawn() {
	return new Promise(function(resolve, reject){
		let serverWorldFolder = sS.modules['properties'].settings.p['level-name'] ? sS.modules['properties'].settings.p['level-name'] : 'Cookies';
		fs.readFile(serverWorldFolder+'/level.dat', function(err, data) {
			if (err) reject(err);
		  else zlib.gunzip(data, function(err, buffer) {
		    if (!err) {
		      var levelData = getObj(NbtReader.readTag(buffer).val, 'name', 'Data');
					let worldSpawn = {};
					worldSpawn.x = getObj(levelData.val, 'name', 'SpawnX').val;
					worldSpawn.y = getObj(levelData.val, 'name', 'SpawnY').val;
					worldSpawn.z = getObj(levelData.val, 'name', 'SpawnZ').val;
					resolve(worldSpawn);
		    } reject(err);
		  });
		});
	})
}

/*
/ Util Functions
*/

function getObj(parentObject, childObjectProperty, childObjectValue) {
	return parentObject.find(function(childObject) { return childObject[childObjectProperty] === childObjectValue; })
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
        var alt = {};

        Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key];
        }, this);

        return alt;
    },
    configurable: true,
    writable: true
});
