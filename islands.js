// Set defaults
var sS = {} // serverSettings
var mS = {} // moduleSettings

const islandCreate = "made a new island!"

// Module command handling
process.on('message', message => {
	switch (message.function) {
		case 'init':
			sS = message.sS;
			mS = sS.modules['islands'].settings;
			break;
		case 'kill':
			process.exit();
			break;
		case 'pushSettings':
			sS = message.sS;
			mS = sS.modules['islands'].settings;
			break;
		case 'serverStdout':
			serverStdout(message.string);
			break;
	}
});

function serverStdout(string) {
	if (string.indexOf(islandCreate) > -1) {
		let maxX = 100000;
		let minX = 1000;

		let maxY = 100000;
		let minY = 1000;

		let randomX = Math.random()*(maxX-minX)+minX;
		let randomY = Math.random()*(maxY-minY)+minY;

		let user = string.slice(37, string.indexOf(islandCreate)-1);
		process.send({ function: 'serverStdin', string: `tp ${user} ${randomX} 68 ${randomY}\n` }); // Randomtp player
		setTimeout(function(){
			process.send({ function: 'serverStdin', string: `tp ${user} ${randomX} 68 ${randomY}\n` }); // Randomtp player
			for (let x = -1; x <= 1; x++) {
				for (let y = -1; y <= 1; y++) {
					process.send({ function: 'serverStdin', string: `setblock ${randomX+x} 64 ${randomY+y} dirt 0 keep\n` });
				}
			}
			process.send({ function: 'serverStdin', string: `setblock ${randomX} 65 ${randomY} minecraft:sapling 0 keep\n` });
		}, 500);
		process.send({ function: 'serverStdin', string: `tell ${user} Hia, please set your home using /sethome home. If you happened near someones base just head back to spawn and try again!\n` });
	}
}