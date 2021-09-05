// const thisModule = 'mineapi';

// // Import core packages
// const util = require('./util/request.js');
// const modul = new [require('./modul.js')][0](thisModule);

// // Set defaults
// let sS = {} // serverSettings
// let mS = {} // moduleSettings
// let fn = {
// 	init: async message => {
// 		[sS, mS] = modul.loadSettings(message)
// 		players = new PlayerStore();
// 	}
// }; // moduleFunctions
// let players = null // Storage for player data;

// class PlayerStore {
// 	constructor() {
// 		this.playerStore = [];
// 		this.playerStoreLocation = {};
// 	}
// 	async add(playerClassInstance) {
// 		this.playerStore.push(playerClassInstance)
// 		let playerIndex = this.playerStore.indexOf(playerClassInstance);
// 		this.playerStoreLocation[(await playerClassInstance.username).toLowerCase()] = playerIndex;
// 		this.playerStoreLocation[await playerClassInstance.uuid] = playerIndex;
// 		return playerClassInstance;
// 	}
// 	get(playerKey) {
// 		return (async () => {
// 			let player = this.playerStore[this.playerStoreLocation[playerKey.toLowerCase()]];
// 			if (player) return player;
// 			let isUUID = playerKey.length > 16;
// 			player = new Player(!isUUID?playerKey:null, isUUID?playerKey:null);
// 			players.add(await player);
// 			return player;
// 		})()
// 	}
// }

// class Player {
// 	constructor(username=null, uuid=null) {
// 		return (async () => {
// 			if (username == null && uuid == null) throw new Error('UUID or Username must be provided when creating a player');

// 			if (username != null) this.username = username;
// 			else this._username = null;

// 			if (this._uuid != null) this.uuid = uuid
// 			else this._uuid = null;

// 			this._uuid = await this.uuid;
// 			this._username = await this.username;
// 			this._dirtyUUID = await this.dirtyUUID;

// 			return this;
// 		})()
// 	}

// 	get dirtyUUID() {
// 		return (async () => {
// 			if (this._dirtyUUID) return this._dirtyUUID
// 			return await this.makeDirtyUUID(await this.uuid);
// 		})()
// 	}

// 	set uuid(uuid) {
// 		return (async () => {
// 			this._uuid = await this.makeDirtyUUID(await uuid);
// 		})()
// 	}
// 	get uuid() {
// 		return (async () => {
// 			if (this._uuid) return this._uuid;
// 			//console.log('Fetch UUID', this._uuid);
// 			const data = await util.pRequestGet({
// 				url: `https://api.mojang.com/users/profiles/minecraft/${this._username}`,
// 				json: true,
// 			}).catch(err => modul.lErr(err))
// 			this._uuid = data.id;
// 			this._username = data.name;
// 			return this._uuid;
// 		})()
// 	}

// 	set history(history) { this._history = history; }
// 	get history() {
// 		return (async () => {
// 			if (this._history) return this._history;
// 			//console.log('Fetch History', this._history);
// 			const data = await util.pRequestGet({
// 				url: `https://api.mojang.com/user/profiles/${this._uuid}/names`,
// 				json: true,
// 			}).catch(err => modul.lErr(err))
// 			this._username = data[data.length-1].name;
// 			this._history = data;
// 			return this._history;
// 		})()
// 	}

// 	set username(username) { this._username = username; }
// 	get username() {
// 		return (async () => {
// 			if (this._username) return this._username
// 			//console.log('Fetch Username', this._username);
// 			const data = await util.pRequestGet({
// 				url: `https://api.mojang.com/user/profiles/${this._uuid}/names`,
// 				json: true,
// 			}).catch(err => modul.lErr(err))
// 			this._username = data[data.length-1].name;
// 			this._history = data;
// 			return this._username;
// 		})()
// 	}

// 	// Returns a uuid seperated by dashes
// 	async makeDirtyUUID (uuid) {
// 		if (!uuid) throw new Error('No uuid specified!');
// 		uuid = await this.cleanUUID(uuid).catch(err => modul.lErr)
// 		return uuid = [uuid.slice(0, 8), '-', uuid.slice(8, 12), '-', uuid.slice(12, 16), '-', uuid.slice(16, 20), '-', uuid.slice(20)].join('')
// 	}

// 	// Returns a uuid not seperated by dashes
// 	async cleanUUID (uuid) {
// 		if (!uuid) throw new Error('No uuid specified!');
// 		return uuid.replace(/-/g, '');
// 	}
// }

// fn.getPlayer = async (playerIdentifier) => {
// 	return players.get(playerIdentifier);
// }

// // Module command handling
// process.on('message', message => {
// 	switch (message.function) {
// 		case 'pushSettings':
// 			[sS, mS] = modul.loadSettings(message)
// 			break;
// 		case 'execute':
// 			if (!(message.func in fn)) modul.reject(new Error(`Command ${message.func} does not exist in module ${thisModule}`), message.promiseId, message.returnModule)
// 			else fn[message.func](message.data)
// 			.then(data => modul.resolve(data, message.promiseId, message.returnModule))
// 			.catch(err => modul.reject(err, message.promiseId, message.returnModule))
// 			break;
// 	}
// });
