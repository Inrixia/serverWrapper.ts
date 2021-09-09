// function tpo(args) {
// 	return new Promise((resolve, reject) => {
// 		(async () => {
// 			let playerObj = await modul.call("mineapi", "getPlayer", args.username).catch((err) => reject(err));
// 			let levelName = await modul.call("properties", "getProperty", "level-name").catch((err) => reject(err));
// 			let serverWorldFolder = levelName ? levelName : "Cookies";
// 			fs.readFile(`${serverWorldFolder}/playerdata/${playerObj._dirtyUUID}.dat`, (err, data) => {
// 				if (err) reject(err);
// 				else
// 					zlib.gunzip(data, async (err, buffer) => {
// 						if (err) reject(err);
// 						let playerData = NbtReader.readTag(buffer);
// 						let playerPosIndex = playerData.val.indexOf(await modul.getObj(playerData.val, "name", "Pos"));
// 						playerData.val[playerPosIndex].val.list[0].val = args.x;
// 						playerData.val[playerPosIndex].val.list[1].val = args.y;
// 						playerData.val[playerPosIndex].val.list[2].val = args.z;
// 						zlib.gzip(NbtWriter.writeTag(playerData), (err, playerDataBuffer) => {
// 							fs.writeFile(serverWorldFolder + `/playerdata/${playerObj._dirtyUUID}.dat`, playerDataBuffer, (err, data) => {
// 								if (err) reject(err);
// 								resolve(args);
// 							});
// 						});
// 					});
// 			});
// 		})();
// 	});
// }

// 			(fn.tpo = async (message) => {
// 				let vars = await tpo({
// 					username: message.args[1],
// 					x: message.args[2],
// 					y: message.args[3],
// 					z: message.args[4],
// 				});
// 				return {
// 					// Set inrix's position to 100 50 100
// 					console: `whiteSet ${sS.c["blueBright"].c}${vars.username}white's postion to ${sS.c["orange"].c}${vars.x} {red${vars.y} ${sS.c["blueBright"].c}${vars.z} }`,
// 					minecraft: `tellraw ${message.logTo.user} ${JSON.stringify([
// 						{
// 							text: `Set `,
// 							color: "white",
// 						},
// 						{
// 							text: `${vars.username}`,
// 							color: "blueBright",
// 						},
// 						{
// 							text: `'s postion to `,
// 							color: "white",
// 						},
// 						{
// 							text: `${vars.x} `,
// 							color: "orange",
// 						},
// 						{
// 							text: `${vars.y} `,
// 							color: "red",
// 						},
// 						{
// 							text: `${vars.z}`,
// 							color: "blueBright",
// 						},
// 					])}\n`,
// 					discord: {
// 						string: null,
// 						embed: {
// 							color: parseInt(sS.c[sS.modules["nbt"].discordColor || sS.modules["nbt"].color].h, 16),
// 							title: `Set ${vars.username}'s postion to ${vars.x} ${vars.y} ${vars.z}`,
// 							description: null,
// 							timestamp: new Date(),
// 						},
// 					},
// 				};
// 			});
// {
// 					name: "tpo",
// 					exeFunc: "tpo",
// 					module: thisModule,
// 					description: {
// 						console: `whiteBrightSet the coordinates of a given player in their playerdata to the coordinates specified. }\nExample: yellow~tpo ${sS.c["blueBright"].c}Username ${sS.c["orange"].c}0 white100 ${sS.c["blueBright"].c}0}`,
// 						minecraft: [
// 							{
// 								text: `Teleports player to given chunk coords.\n`,
// 								color: "white",
// 							},
// 							{
// 								text: "Example: ",
// 								color: "gray",
// 							},
// 							{
// 								text: "~tpo ",
// 								color: sS.c["yellowBright"].m,
// 							},
// 							{
// 								text: "Username ",
// 								color: sS.c["blueBright"].m,
// 							},
// 							{
// 								text: "0 ",
// 								color: sS.c["orange"].m,
// 							},
// 							{
// 								text: "100 ",
// 								color: "gray",
// 							},
// 							{
// 								text: "0 ",
// 								color: sS.c["blueBright"].m,
// 							},
// 							{
// 								text: "sets user coords to ",
// 								color: "gray",
// 							},
// 							{
// 								text: "160 ",
// 								color: sS.c["orange"].m,
// 							},
// 							{
// 								text: "100 ",
// 								color: "gray",
// 							},
// 							{
// 								text: "160",
// 								color: sS.c["blueBright"].m,
// 							},
// 						],
// 						discord: {
// 							string: null,
// 							embed: {
// 								title: "Set a offline player's coords",
// 								description: "~tpo",
// 								color: parseInt("e77c02", 16), // Orange
// 								timestamp: new Date(),
// 								fields: [
// 									{
// 										name: "Description",
// 										value: "Takes Username, x, y and z coords given, and sets the player's playerdata coords to them.",
// 									},
// 									{
// 										name: "Example",
// 										value: "**~tpo** Username 10 0 10 set player's coords to 10 0 10",
// 									},
// 								],
// 							},
// 						},
// 					},
// 				},
