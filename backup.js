const thisModule = 'backup';

// Import core packages
const moment = require('moment');
const modul = new [require('./modul.js')][0](thisModule)
const util = {
	...require('./util/children.js'),
	...require('./util/time.js')
}

// Set defaults
let sS = {} // serverSettings
let mS = {} // moduleSettings

let backupInterval = null;
let timeToNextBackup = null;
let lastBackupDuration = null;
let lastBackupStartTime = null;
let lastBackupEndTime = null;
let lastBackupDurationString = null;

let fn = {
	init: async message => {
		[sS, mS] = modul.loadSettings(message)
		startBackupInterval();
		modul.event.on('fetchStats', () => {
			modul.emit('pushStats', { 
				timeToNextBackup: timeToNextBackup ? timeToNextBackup.fromNow() : 'Backups disabled', 
				timeSinceLastBackup: (lastBackupEndTime != null) ? lastBackupEndTime.fromNow() : null, 
				lastBackupDuration: lastBackupDurationString 
			})
		})
		modul.event.on('fetchCommands', () => {
			modul.emit('exportCommands', [{
				name: 'backup',
				exeFunc: 'runBackup',
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Starts a backup. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~backup${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Starts a backup. `,
						"color": sS.c['brightWhite'].m
					}, {
						"text": 'Example: ',
						"color": sS.c['white'].m
					}, {
						"text": '~backup ',
						"color": sS.c['yellow'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Backup",
							description: "~backup",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Starts a backup."
							}, {
								name: "Example",
								value: "**~backup**"
							}]
						}
					}
				}
			}, {
				name: 'startBackupInterval',
				exeFunc: 'startBackupInterval',
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Starts automatic backups. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~startBackupInterval${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Starts automatic backups. `,
						"color": sS.c['brightWhite'].m
					}, {
						"text": 'Example: ',
						"color": sS.c['white'].m
					}, {
						"text": '~startBackupInterval ',
						"color": sS.c['yellow'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Start Backup Interval",
							description: "~startBackupInterval",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Starts automatic backups."
							}, {
								name: "Example",
								value: "**~startBackupInterval**"
							}]
						}
					}
				}
			}, {
				name: 'clearBackupInterval',
				exeFunc: 'clearBackupInterval',
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Stops automatic backups. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~clearBackupInterval${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Stops automatic backups. `,
						"color": sS.c['brightWhite'].m
					}, {
						"text": 'Example: ',
						"color": sS.c['white'].m
					}, {
						"text": '~clearBackupInterval ',
						"color": sS.c['yellow'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Clear Backup Interval",
							description: "~clearBackupInterval",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Stops automatic backups."
							}, {
								name: "Example",
								value: "**~clearBackupInterval**"
							}]
						}
					}
				}
			}, {
				name: 'setBackupInterval',
				exeFunc: 'setBackupInterval',
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Sets backup interval in hours. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~setBackupInterval ${sS.c['brightBlue'].c}1${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Sets backup interval in hours. `,
						"color": sS.c['brightWhite'].m
					}, {
						"text": 'Example: ',
						"color": sS.c['white'].m
					}, {
						"text": '~setBackupInterval ',
						"color": sS.c['yellow'].m
					}, {
						"text": '1',
						"color": sS.c['brightBlue'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Set Backup Interval",
							description: "~setBackupInterval",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Sets backup interval in hours."
							}, {
								name: "Example",
								value: "**~setBackupInterval** 1"
							}]
						}
					}
				}
			}, {
				name: 'backupDir',
				exeFunc: 'getbackupDir',
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Gets backup directory. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~backupDir${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Gets backup directory. `,
						"color": sS.c['brightWhite'].m
					}, {
						"text": 'Example: ',
						"color": sS.c['white'].m
					}, {
						"text": '~backupDir',
						"color": sS.c['yellow'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Get Backup Directory",
							description: "~backupDir",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Gets backup directory."
							}, {
								name: "Example",
								value: "**~backupDir**"
							}]
						}
					}
				}
			}, {
				name: 'nextBackup',
				exeFunc: 'nextBackup',
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Gets time to next backup. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~nextBackup${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Gets time to next backup. `,
						"color": sS.c['brightWhite'].m
					}, {
						"text": 'Example: ',
						"color": sS.c['white'].m
					}, {
						"text": '~nextBackup',
						"color": sS.c['yellow'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Next Backup",
							description: "~nextBackup",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Gets time to next backup."
							}, {
								name: "Example",
								value: "**~nextBackup**"
							}]
						}
					}
				}
			}, {
				name: 'lastBackup',
				exeFunc: 'lastBackup',
				module: thisModule,
				description: {
					console: `${sS.c['white'].c}Gets last backup info. ${sS.c['reset'].c}Example: ${sS.c['yellow'].c}~lastBackup${sS.c['reset'].c}`,
					minecraft: [{
						"text": `Gets last backup info. `,
						"color": sS.c['brightWhite'].m
					}, {
						"text": `Example: `,
						"color": sS.c['white'].m
					}, {
						"text": `~lastBackup`,
						"color": sS.c['yellow'].m
					}],
					discord: {
						string: null,
						embed: {
							title: "Last Backup",
							description: "~lastBackup",
							color: parseInt(sS.c['orange'].h, 16),
							timestamp: new Date(),
							fields: [{
								name: "Description",
								value: "Gets last backup info, time etc."
							}, {
								name: "Example",
								value: "**~lastBackup**"
							}]
						}
					}
				}
			}])
		})
	},
	startBackupInterval: async () => {
		if (backupInterval) await clearInterval(backupInterval);
		await startBackupInterval();
		return {
			console: `${sS.c[sS.modules['backup'].color].c}Automatic backup's started!${sS.c['reset'].c} Next backup in ${moment(timeToNextBackup).fromNow()}`,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
				[{
					"text": `Automatic backup's started!`,
					"color": sS.c[sS.modules['backup'].color].m
				}, {
					"text": `Next backup in ${moment(timeToNextBackup).fromNow()}`,
					"color": "white"
				}]
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['backup'].discordColor||sS.modules['backup'].color].h, 16),
					title: `Automatic backup's started...`,
					description: `Next backup in ${moment(timeToNextBackup).fromNow()}`,
					timestamp: new Date()
				}
			}
		}
	},
	clearBackupInterval: async () => {
		await clearInterval(backupInterval);
		timeToNextBackup = null;
		await pushStats();
		return {
			console: `${sS.c[sS.modules['backup'].color].c}Automatic backup's stopped!${sS.c['reset'].c}`,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
				{
					"text": `Automatic backup's stopped!`,
					"color": sS.c[sS.modules['backup'].color].m
				}
			)}\n`,
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['backup'].discordColor||sS.modules['backup'].color].h, 16),
					title: `Automatic backup's stopped...`,
					description: null,
					timestamp: new Date()
				}
			}
		}
	},
	setBackupInterval: async (data) => {
		await clearInterval(backupInterval);
		mS.backupIntervalInHours = data.args[1];
		timeToNextBackup = moment().add(data.args[1], 'hours');
		if (data.args[2]) await modul.saveSettings(sS, mS);
		return await startBackupInterval()
	},
	setBackupDir: async (data) => {
		mS.overrideBackupDir = data.backupDir;
	},
	getBackupDir: async () => {
		let backupDir =  (mS.overrideBackupDir)?mS.overrideBackupDir:`${mS.rootBackupDir}/${sS.serverName}`
		return {
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['backup'].discordColor||sS.modules['backup'].color].h, 16),
					title: `Saving backups in: ${backupDir}`,
					description: null,
					timestamp: new Date()
				}
			},
			console: `Saving backups in: ${sS.c[sS.modules['backup'].color].c}${backupDir}${sS.c['reset'].c}`,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
				[{
					"text": `Saving backups in: `,
					"color": "white"
				}, {
					"text": backupDir,
					"color": sS.c[sS.modules['backup'].color].m
				}]
			)}\n`
		}
	},
	runBackup: runBackup,
	nextBackup: async message => {
		return {
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['backup'].discordColor||sS.modules['backup'].color].h, 16),
					title: `${timeToNextBackup ? `Next backup in ${moment(timeToNextBackup).fromNow()}` : 'Backups disabled...'}`,
					description: null,
					timestamp: new Date()
				}
			},
			console: `${ timeToNextBackup ? `${sS.c[sS.modules['backup'].color].c}Next backup ${moment(timeToNextBackup).fromNow()}` : `${sS.c[sS.modules['backup'].color].c}Backups disabled...`}${sS.c['reset'].c}`,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
				[{
					"text": timeToNextBackup ? `Next backup ` : 'Backups disabled...',
					"color": timeToNextBackup ? '' : sS.c[sS.modules['backup'].color].m
				}, {
					"text": timeToNextBackup ? moment(timeToNextBackup).fromNow() : '',
					"color": timeToNextBackup ? sS.c[sS.modules['backup'].color].m : ''
				}]
			)}\n`
		}
	},
	lastBackup: async () => {
		return {
			discord : {
				string: null,
				embed: {
					color: parseInt(sS.c[sS.modules['backup'].discordColor||sS.modules['backup'].color].h, 16),
					title: (lastBackupStartTime) ? `Last backup happened ${moment(lastBackupStartTime).fromNow()}` : "No backup has occoured yet...",
					description: lastBackupDuration ? `Took: ${lastBackupDuration}` : null,
					timestamp: new Date()
				}
			},
			console: `${(lastBackupStartTime) ? `Last backup happened ${sS.c[sS.modules['backup'].color].c}${moment(lastBackupStartTime).fromNow()}` : `${sS.c[sS.modules['backup'].color].c}No backup has occoured yet...`}${sS.c['reset'].c}`,
			minecraft: `tellraw ${message.logTo.user} ${JSON.stringify(
				[{
					"text": `${(lastBackupStartTime) ? 'Last backup happened ' : 'No backup has occoured yet...'}`,
					"color": (lastBackupStartTime) ? '' : sS.c[sS.modules['backup'].color].m
				}, {
					"text": `${(lastBackupStartTime) ? moment(lastBackupStartTime).fromNow() : ''}`,
					"color": (lastBackupStartTime) ? sS.c[sS.modules['backup'].color].m : ''
				}]
			)}\n`
		}
	}
}

// Module command handling
process.on('message', async message => {
	switch (message.function) {
		case 'execute':
			if (!(message.func in fn)) modul.reject(new Error(`Command ${message.func} does not exist in module ${thisModule}`), message.promiseId, message.returnModule)
			else fn[message.func](message.data)
			.then(data => modul.resolve(data, message.promiseId, message.returnModule))
			.catch(err => modul.reject(err, message.promiseId, message.returnModule))
			break;
		case 'pushSettings':
			[sS, mS] = modul.loadSettings(message)
			break;
	}
});

async function startBackupInterval() {
	timeToNextBackup = moment().add(mS.backupIntervalInHours, 'hours');
	await modul.call('stats', 'pushStats', { 
		timeToNextBackup: timeToNextBackup?timeToNextBackup.fromNow():'Backups disabled', 
		timeSinceLastBackup: (lastBackupEndTime != null) ? lastBackupEndTime.fromNow() : null, 
		lastBackupDuration: lastBackupDurationString 
	})
	backupInterval = setInterval(async () => {
		if ((await modul.call('properties', 'ping')).players.online == 0) {
			process.stdout.write(mS.messages.backupSkipped.console+'\n');
			return;
		}
		await runBackup().catch(err => modul.lErr(err, 'Backup failed!'));
		timeToNextBackup = moment().add(mS.backupIntervalInHours, 'hours');
	}, mS.backupIntervalInHours*60*60*1000);
	return timeToNextBackup;
}

async function runBackup() {
	return await backup().catch(async err => {
		await modul.call('serverWrapper', 'serverStdin', 'save-on\n');
		throw err;
	})
}

async function backup() {
	let sshOpen = `ssh ${mS.remote.user}@${mS.remote.ip} -p ${mS.remote.port}`
	let excludes = ``;
	if (mS.excludes.length > 0) mS.excludes.forEach(exclude => excludes += `--exclude ${exclude} `)
	lastBackupStartTime = moment();
	await modul.call('serverWrapper', 'serverStdin', 'save-off\n');
	process.stdout.write(mS.messages.backupStarting.console+'\n');
	await modul.call('serverWrapper', 'serverStdin', mS.messages.backupStarting.minecraft+'\n')
	await modul.call('stats', 'pushStats', { status: 'Backing Up', timeToBackup: timeToNextBackup.fromNow() })
	let backupDir = mS.overrideBackupDir ? mS.overrideBackupDir : `${mS.remote.rootBackupDir}/${sS.serverName}`;
	await util.pExec(`${sshOpen} "mkdir -p ${backupDir} && mkdir -p ${mS.remote.publicBackupDir} && mkdir -p ${mS.remote.publicBackupDir}/${sS.serverName}/"`, {})
	//children.spawn('robocopy', [sS.modules['properties'].settings.p['level-name'], `${backupDir}/${moment().format('MMMMDDYYYY_h-mm-ssA')}/Cookies`, (mS.threads > 1) ? `/MT:${mS.threads}` : '', '/E'], {shell: true, detached: true}).on('close', function (code) {
	await util.pExec(`rsync-snapshot --src ${sS.server_dir} --shell "ssh -p ${mS.remote.port}" --dst ${mS.remote.user}@${mS.remote.ip}:${backupDir} ${excludes} --maxSnapshots ${mS.maxBackups}`, { maxBuffer: 1024*1024*128 })
	let backupFolders = (await util.pExec(`${sshOpen} "ls /mnt/redlive/LiveArchives/${sS.serverName}"`)).split(/\r?\n/)
	let latestFolder = backupFolders.slice(-3, -2)[0];
	let datedRemoteFolder = `${mS.remote.publicBackupDir}/${sS.serverName}/${latestFolder}`
	let latestRemoteFolder = `${mS.remote.publicBackupDir}/${sS.serverName}/latest`
	let existingLinkedFolders = (backupFolders.length > 3)?await util.pExec(`${sshOpen} "ls ${latestRemoteFolder}"`):[]
	for (fIndex in mS.publicBackupFolders) {
		let folder = mS.publicBackupFolders[fIndex];
		if (folder == 'WORLD') folder = await modul.call('properties', 'getProperty', 'level-name');
		let sourceFolder = `${backupDir}/${latestFolder}/${sS.serverName}/${folder}`
		await util.pExec(`${sshOpen} "mkdir -p ${latestRemoteFolder} && mkdir -p ${datedRemoteFolder}"`, {})
		if (existingLinkedFolders.indexOf(folder) > -1) await util.pExec(`${sshOpen} "unlink ${latestRemoteFolder}/${folder}"`, {})
		await util.pExec(`${sshOpen} "ln -s ${sourceFolder} ${datedRemoteFolder} && ln -s ${sourceFolder} ${latestRemoteFolder}"`)
	}
	lastBackupEndTime = moment();
	lastBackupDuration = moment.duration(lastBackupEndTime.diff(lastBackupStartTime));
	let t = {
		ms: lastBackupDuration.milliseconds(),
		s: lastBackupDuration.seconds(),
		m: lastBackupDuration.minutes(),
		h: lastBackupDuration.hours()
	}
	lastBackupDurationString = `${(t.m>0) ? `${t.m}min, ` : ''}${(t.s>0) ? `${t.s}sec, ` : ''}${(t.ms>0) ? `${t.ms}ms` : ''}`;
	await modul.call('serverWrapper', 'serverStdin', 'save-on\n');
	process.stdout.write(mS.messages.backupEnded.console.replace("%duration%", lastBackupDurationString)+'\n');
	await modul.call('serverWrapper', 'serverStdin', mS.messages.backupEnded.minecraft.replace("%duration%", lastBackupDurationString)+'\n')
	await modul.call('stats', 'pushStats', {
		status: 'Running',
		timeToNextBackup: timeToNextBackup?timeToNextBackup.fromNow():'Backups disabled', 
		timeSinceLastBackup: (lastBackupEndTime != null) ? lastBackupEndTime.fromNow() : null, 
		lastBackupDuration: lastBackupDurationString 
	})
	return lastBackupDurationString
}