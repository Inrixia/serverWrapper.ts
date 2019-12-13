const thisModule = 'nbt';

// Import core packages
const fs = require('fs');
const zlib = require('zlib');
const NbtReader = require('node-nbt').NbtReader;
const NbtWriter = require('node-nbt').NbtWriter;

const modul = new [require('./modul.js')][0](thisModule);

// Set defaults
let sS = {} // serverSettings
let mS = {} // moduleSettings

//Add variable for ~tpo dimension ID
let dimID

let fn = {
	init: async message => {
		[sS, mS] = modul.loadSettings(message),
		fn.tpo = async message => { 
			let vars = await tpo({
				username: message.args[1],
				x: message.args[2],
				y: message.args[3],
				z: message.args[4],
				dimID: message.args[5]
			})
			return {
				// Set inrix's position to 100 50 100
				console: `${sS.c['white'].c}Set ${sS.c['brightBlue'].c}${vars.username}${sS.c['white'].c}'s postion to ${sS.c['orange'].c}${vars.x} ${sS.c['red'].c}${vars.y} ${sS.c['brightBlue'].c}${vars.z} ${sS.c['white'].c}in dimension with id${sS.c['green'].c} ${dimID} ${sS.c['reset'].c}`,
				minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
					[{
						"text": `Set `,
						"color": "white"
					}, {
						"text": `${vars.username}`,
						"color": "brightBlue"
					}, {
						"text": `'s postion to `,
						"color": "white"
					}, {
						"text": `${vars.x} `,
						"color": "orange"
					}, {
						"text": `${vars.y} `,
						"color": "red"
					}, {
						"text": `${vars.z}`,
						"color": "brightBlue"
					}, {
						"text": ` in dimension with id `,
						"color": "white"
					}, {
						"text": `${dimID}`,
						"color": "Green"
					}]
				)}\n`,
				discord : {
					string: null,
					embed: {
						color: parseInt(sS.c[sS.modules['nbt'].discordColor||sS.modules['nbt'].color].h, 16),
						title: `Set ${vars.username}'s postion to ${vars.x} ${vars.y} ${vars.z} in dimension with id ${dimID}`,
						description: null,
						timestamp: new Date()
					}
				}
			}
		};
		fn.getSpawn = async message => {
			let worldSpawn = await getSpawn();
			return {
				console: `${sS.c[sS.modules['nbt'].color].c}World spawn is ${sS.c['reset'].c}${worldSpawn.x} ${worldSpawn.y} ${worldSpawn.z}`,
				minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
					[{
						"text": `World spawn is `,
						"color": sS.c[sS.modules['nbt'].color].m
					}, {
						"text": `${worldSpawn.x} ${worldSpawn.y} ${worldSpawn.z}`,
						"color": "white"
					}]
				)}\n`,
				discord : {
					string: null,
					embed: {
						color: parseInt(sS.c[sS.modules['nbt'].discordColor||sS.modules['nbt'].color].h, 16),
						title: `World spawn is ${worldSpawn.x} ${worldSpawn.y} ${worldSpawn.z}`,
						description: null,
						timestamp: new Date()
					}
				}
			}
		}
		fn.tpSpawn = async message => {
			let vars = await tpSpawn({player: message.args[1]})
			if (vars != 'ERROR') {
			return {
				// Set inrix's position to 100 50 100
				console: `${sS.c['white'].c}Set ${sS.c['brightBlue'].c}${vars.username}${sS.c['white'].c}'s postion to ${sS.c['orange'].c}${vars.x} ${sS.c['red'].c}${vars.y} ${sS.c['brightBlue'].c}${vars.z} ${sS.c['white'].c}in dimension with id${sS.c['green'].c} ${dimID} ${sS.c['reset'].c}`,
				minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
					[{
						"text": `Set `,
						"color": "white"
					}, {
						"text": `${vars.username}`,
						"color": "brightBlue"
					}, {
						"text": `'s postion to `,
						"color": "white"
					}, {
						"text": `${vars.x} `,
						"color": "orange"
					}, {
						"text": `${vars.y} `,
						"color": "red"
					}, {
						"text": `${vars.z}`,
						"color": "brightBlue"
					}, {
						"text": ` in dimension with id `,
						"color": "white"
					}, {
						"text": `${dimID}`,
						"color": "Green"
					}]
				)}\n`,
				discord : {
					string: null,
					embed: {
						color: parseInt(sS.c[sS.modules['nbt'].discordColor||sS.modules['nbt'].color].h, 16),
						title: `Set ${vars.username}'s postion to ${vars.x} ${vars.y} ${vars.z} in dimension with id ${dimID}`,
						description: null,
						timestamp: new Date()
					}
				}
			}}
		}
		fn.getPos = async message => {
			let vars = await getPos({username: message.args[1]})
			return {
				console: `${sS.c['white'].c}Player: ${sS.c['brightBlue'].c}${vars.username}${sS.c['white'].c} X: ${sS.c['orange'].c}${vars.x} ${sS.c['white'].c}Y:${sS.c['red'].c} ${vars.y} ${sS.c['white'].c}Z:${sS.c['brightBlue'].c} ${vars.z} ${sS.c['white'].c}Dimension ID:${sS.c['green'].c} ${vars.dimID} ${sS.c['reset'].c}`,
				minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
					[{
						"text": `Player: `,
						"color": "white"
					}, {
						"text": `${vars.username}`,
						"color": "brightBlue"
					}, {
						"text": ` X: `,
						"color": "white"
					}, {
						"text": `${vars.x} `,
						"color": "orange"
					}, {
						"text": ` Y: `,
						"color": "white"
					}, {
						"text": `${vars.y} `,
						"color": "red"
					}, {
						"text": ` Z: `,
						"color": "white"
					}, {
						"text": `${vars.z}`,
						"color": "brightBlue"
					}, {
						"text": ` Dimension ID: `,
						"color": "white"
					}, {
						"text": `${vars.dimID}`,
						"color": "green"
					}]
				)}\n`,
				discord : {
					string: null,
					embed: {
						color: parseInt(sS.c[sS.modules['nbt'].discordColor||sS.modules['nbt'].color].h, 16),
						title: `Player: **${vars.username}** \nX: **${vars.x}** \nY: **${vars.y}** \nZ: **${vars.z}** \nDimension ID: **${vars.dimID}**`,
						description: null,
						timestamp: new Date()
					}
				}
			}
		}
		fn.whereIs = async message => {
		let vars = await getPos({username: message.args[1]})
		
		if (vars.dimID == '0') {vars.dimID = 'Overworld'}
		else if (vars.dimID == '1') {vars.dimID = 'The End'}
		else if (vars.dimID == '-1') {vars.dimId = 'Nether'}

		if (vars.flying == '1') {vars.flying = 'yes'}
		else {vars.flying = 'no'}

		if (vars.onGround == '1') {vars.onGround = 'yes'}
		else {vars.onGround = 'no'}

		return {
			console: `${sS.c['white'].c}Player ${sS.c['brightBlue'].c}${vars.username}${sS.c['white'].c} is at ${sS.c['orange'].c}${vars.x}${sS.c['white'].c}${sS.c['red'].c} ${vars.y}${sS.c['white'].c}${sS.c['brightBlue'].c} ${vars.z} ${sS.c['white'].c}in dimension${sS.c['green'].c} ${vars.dimID} ${sS.c['white'].c} \nHealth: ${vars.health} \nFlying: ${vars.flying} \nOn ground: ${vars.onGround} ${sS.c['reset'].c}`,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
				[{
					"text": `Player `,
					"color": "white"
				}, {
					"text": `${vars.username}`,
					"color": "brightBlue"
				}, {
					"text": ` is at `,
					"color": "white"
				}, {
					"text": `${vars.x} `,
					"color": "orange"
				}, {
					"text": `${vars.y} `,
					"color": "red"
				}, {
					"text": `${vars.z}`,
					"color": "brightBlue"
				}, {
					"text": ` in dimension `,
					"color": "white"
				}, {
					"text": `${vars.dimID}.`,
					"color": "green"
				}, {
					"text": `Health: `,
					"color": "white"
				}, {
					"text": `${vars.health}`,
					"color": "yellow"
				}, {
					"text": `. Flying: `,
					"color": "white"
				}, {
					"text": ` ${vars.flying}`,
					"color": "green"
				},{
					"text": `. On ground: `,
					"color": "white"
				}, {
					"text": `${vars.onGround}`,
					"color": "blue"
				}, {
					"text": `.`,
					"color": "white"
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['nbt'].discordColor||sS.modules['nbt'].color].h, 16),
					title: `Player ${vars.username} is at ${vars.x} ${vars.y} ${vars.z} in dimension ${vars.dimID}`,
					description: `Is on ground: ${vars.onGround} \nHealth: ${vars.health} \nFlying: ${vars.flying}`,
					timestamp: new Date()
				}
			}
		}
		}
		modul.event.on('fetchCommands', () => {
			modul.emit('exportCommands', [{
				name: 'tpo',
				exeFunc: 'tpo',
				module: thisModule,
				description: {
					console: `${sS.c['brightWhite'].c}Set the coordinates(and optionally dimension id) of a given player in their playerdata to the coordinates specified. ${sS.c['reset'].c}\nExample: ${sS.c['yellow'].c}~tpo ${sS.c['brightBlue'].c}Username ${sS.c['orange'].c}0 ${sS.c['white'].c}100 ${sS.c['brightBlue'].c}0 ${sS.c['green'].c}0${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Teleports player to given chunk coords and optionally dimension.\n`,
						"color": sS.c['brightWhite'].m
					}, {
						"text": 'Example: ',
						"color": sS.c['white'].m
					}, {
						"text": '~tpo ',
						"color": sS.c['brightYellow'].m
					}, {
						"text": 'Username ',
						"color": sS.c['brightBlue'].m
					}, {
						"text": '0 ',
						"color": sS.c['orange'].m
					}, {
						"text": '100 ',
						"color": sS.c['white'].m
					}, {
						"text": '0 ',
						"color": sS.c['brightBlue'].m
					}, {
						"text": "sets user coords to ",
						"color": sS.c['white'].m
					}, {
						"text": '160 ',
						"color": sS.c['orange'].m
					}, {
						"text": '100 ',
						"color": sS.c['white'].m
					}, {
						"text": '160',
						"color": sS.c['brightBlue'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Set a offline player's coords",
							description: "~tpo",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Takes Username, x, y and z coords given(optionally dimension id), and sets the player's playerdata coords to them."
							}, {
								name: "Example",
								value: "**~tpo** Username 10 0 10 0 set player's coords to 10 0 10 and dimension to 0"
							}]
						}
					}
				}
			}, {
				name: 'getSpawn',
				exeFunc: 'getSpawn',
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Gets server spawn coords. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~getSpawn${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Gets server spawn coords. `,
						"color": sS.c['brightWhite'].m
					}, {
						"text": `Example: `,
						"color": sS.c['white'].m
					}, {
						"text": `~getSpawn`,
						"color": sS.c['yellow'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Get Spawn Coords",
							description: "~getSpawn",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Gets server spawn coords."
							}, {
								name: "Example",
								value: "**~getSpawn**"
							}]
						}
					}
				}
			}, {
				name: 'tpSpawn',
				exeFunc: 'tpSpawn',
				module: thisModule,
				description: {}
			}, {
				name: 'getPos',
				exeFunc: 'getPos',
				module: thisModule,
				description: {}
			}, {
				name: 'whereIs',
				exeFunc: 'whereIs',
				module: thisModule,
				description: {}
			}])
		})
	},
};

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'pushSettings':
			[sS, mS] = modul.loadSettings(message)
			break;
		case 'execute':
			if (!(message.func in fn)) modul.reject(new Error(`Command ${message.func} does not exist in module ${thisModule}`), message.promiseId, message.returnModule)
			else fn[message.func](message.data)
			.then(data => modul.resolve(data, message.promiseId, message.returnModule))
			.catch(err => modul.reject(err, message.promiseId, message.returnModule))
			break;
	}
});

async function tpo(args) {
    if (!args.username) throw new Error("Username not given.")
    if (!args.x) throw new Error("X position not given.")
    if (!args.y) throw new Error("Y position not given.")
	if (!args.z) throw new Error("Z position not given.")
    let playerObj = await modul.call('mineapi', 'getPlayer', args.username).catch(err => reject(err));
    let levelName = await modul.call('properties', 'getProperty', 'level-name').catch(err => reject(err))
    let serverWorldFolder = levelName?levelName:'Cookies';
    const data = await new Promise((resolve, reject) => fs.readFile(`${serverWorldFolder}/playerdata/${playerObj._dirtyUUID}.dat`, (err, data) => {
        if (err) reject(err);
        else resolve(data)
    }))
    const buffer = await new Promise((resolve, reject) => zlib.gunzip(data, (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer)
    }))
    let playerData = NbtReader.readTag(buffer);
    let playerPosIndex = playerData.val.indexOf(await modul.getObj(playerData.val, 'name', 'Pos'));
    let playerDimIDIndex = playerData.val.indexOf(await modul.getObj(playerData.val, 'name', 'Dimension'))
    playerData.val[playerPosIndex].val.list[0].val = args.x;
    playerData.val[playerPosIndex].val.list[1].val = args.y;
    playerData.val[playerPosIndex].val.list[2].val = args.z;
    if (args.dimID) {dimID = args.dimID} else {dimID = playerData.val[playerDimIDIndex].val};
    if (dimID) playerData.val[playerDimIDIndex].val = dimID;
    const playerDataBuffer = await new Promise((resolve, reject) => zlib.gzip(NbtWriter.writeTag(playerData), (err, playerDataBuffer) => {
        if (err) reject(err)
        else resolve(playerDataBuffer)
    }))
    await new Promise((resolve, reject) => fs.writeFile(serverWorldFolder+`/playerdata/${playerObj._dirtyUUID}.dat`, playerDataBuffer, (err, data) => {
        if (err) reject(err);
        resolve(data);
    }))
    return args
}

async function getSpawn() {
	return new Promise(function(resolve, reject){
		(async () => {
			let levelName = await modul.call('properties', 'getProperty', 'level-name').catch(err => reject(err))
			let serverWorldFolder = levelName?levelName: 'Cookies';
			fs.readFile(`${serverWorldFolder}/level.dat`, function(err, data) {
				if (err) reject(err);
				else zlib.gunzip(data, async (err, buffer) => {
					if (err) reject(err);
					let levelData = await modul.getObj(NbtReader.readTag(buffer).val, 'name', 'Data');
					let worldSpawn = {};
					worldSpawn.x = (await modul.getObj(levelData.val, 'name', 'SpawnX')).val;
					worldSpawn.y = (await modul.getObj(levelData.val, 'name', 'SpawnY')).val;
					worldSpawn.z = (await modul.getObj(levelData.val, 'name', 'SpawnZ')).val;
					resolve(worldSpawn);
				});
			});
		})()
	})
}

async function tpSpawn(args) {
	let worldSpawn = await getSpawn()
	if (args.player) {
		var vars = await tpo({
			username: args.player,
			x: worldSpawn.x,
			y: worldSpawn.y,
			z: worldSpawn.z,
			dimID: '0',
		})
	}
	else {
		let error = new Error('Please provide a player name')
		throw error
	}
	return(vars)
}

async function getPos(args) {
	if (!args.username) throw new Error('Please give a username')
	let playerObj = await modul.call('mineapi', 'getPlayer', args.username).catch(err => reject(err));
    let levelName = await modul.call('properties', 'getProperty', 'level-name').catch(err => reject(err))
    let serverWorldFolder = levelName?levelName:'Cookies';
    const data = await new Promise((resolve, reject) => fs.readFile(`${serverWorldFolder}/playerdata/${playerObj._dirtyUUID}.dat`, (err, data) => {
        if (err) reject(err);
        else resolve(data)
    }))
    const buffer = await new Promise((resolve, reject) => zlib.gunzip(data, (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer)
    }))
    let playerData = NbtReader.readTag(buffer);
    let playerPosIndex = playerData.val.indexOf(await modul.getObj(playerData.val, 'name', 'Pos'));
	let playerDimIDIndex = playerData.val.indexOf(await modul.getObj(playerData.val, 'name', 'Dimension'))
	let playerOnGroundIndex = playerData.val.indexOf(await modul.getObj(playerData.val, 'name', 'OnGround'))
	let playerHealthIndex = playerData.val.indexOf(await modul.getObj(playerData.val, 'name', 'Health'))
	let playerAbilityIndex = playerData.val.indexOf(await modul.getObj(playerData.val, 'name', 'abilities'))
	let playerAbilities = await modul.getObj(NbtReader.readTag(buffer).val, 'name', 'abilities')
	args.x = playerData.val[playerPosIndex].val.list[0].val
	args.y = playerData.val[playerPosIndex].val.list[1].val
	args.z = playerData.val[playerPosIndex].val.list[2].val
	args.dimID = playerData.val[playerDimIDIndex].val
	args.onGround = playerData.val[playerOnGroundIndex].val
	args.health = playerData.val[playerHealthIndex].val
	args.flying = (await modul.getObj(playerAbilities.val, 'name', 'flying')).val
	
	for (value in args) {
		console.log(`${value}: ${args[value]}`)
	}
	return args
}