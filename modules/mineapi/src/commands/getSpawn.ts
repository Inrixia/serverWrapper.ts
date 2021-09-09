// 		fn.getSpawn = async (message) => {
// 			let worldSpawn = await getSpawn();
// 			return {
// 				console: `${sS.c[sS.modules["nbt"].color].c}World spawn is }${worldSpawn.x} ${worldSpawn.y} ${worldSpawn.z}`,
// 				minecraft: `tellraw ${message.logTo.user} ${JSON.stringify([
// 					{
// 						text: `World spawn is `,
// 						color: sS.c[sS.modules["nbt"].color].m,
// 					},
// 					{
// 						text: `${worldSpawn.x} ${worldSpawn.y} ${worldSpawn.z}`,
// 						color: "white",
// 					},
// 				])}\n`,
// 				discord: {
// 					string: null,
// 					embed: {
// 						color: parseInt(sS.c[sS.modules["nbt"].discordColor || sS.modules["nbt"].color].h, 16),
// 						title: `World spawn is ${worldSpawn.x} ${worldSpawn.y} ${worldSpawn.z}`,
// 						description: null,
// 						timestamp: new Date(),
// 					},
// 				},
// 			};
// 		};
// {
// 					name: "getSpawn",
// 					exeFunc: "getSpawn",
// 					module: thisModule,
// 					description: {
// 						console: `whiteGets server spawn coords. }Example: yellow~getSpawn}`,
// 						minecraft: [
// 							{
// 								text: `Gets server spawn coords. `,
// 								color: "white",
// 							},
// 							{
// 								text: `Example: `,
// 								color: "gray",
// 							},
// 							{
// 								text: `~getSpawn`,
// 								color: "gold",
// 							},
// 						],
// 						discord: {
// 							string: null,
// 							embed: {
// 								title: "Get Spawn Coords",
// 								description: "~getSpawn",
// 								color: parseInt("e77c02", 16), // Orange
// 								timestamp: new Date(),
// 								fields: [
// 									{
// 										name: "Description",
// 										value: "Gets server spawn coords.",
// 									},
// 									{
// 										name: "Example",
// 										value: "**~getSpawn**",
// 									},
// 								],
// 							},
// 						},
// 					},
// 				},
