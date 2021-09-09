export * from "./commands";
import * as commands from "./commands";

// Import core packages
import props from "properties";
import mcServerUtils from "minecraft-server-util";
import { promisify } from "util";

const properties = promisify(props.parse);

// Threading
import { ThreadModule } from "@inrixia/threads";
const thread = (module.parent as ThreadModule).thread;

// Import types
import type { CoreExports, Output } from "@spookelton/wrapperHelpers/types";

import { buildModuleInfo } from "@spookelton/wrapperHelpers/modul";
// Export moduleInfo
export const moduleInfo = buildModuleInfo({
	commands,
	color: "cyan",
	description: "All things minecraft.",
});

type JSON = Record<string, any>;

export const getProperties = async (): Promise<JSON | undefined> => {
	const wrapperCore = await thread.require<CoreExports>("@spookelton/serverWrapper");
	const { commandWorkingDirectory } = await wrapperCore.settings();
	return properties(`${commandWorkingDirectory + "/" || "./"}server.properties`, { path: true });
};
export const getStatus = async () => {
	const port = (await getProperties())?.["server-port"] as number;
	return mcServerUtils.status("localhost", { port, enableSRV: false });
};

let commandWorkingDirectory: string | undefined;
export const getCommandWorkingDirectory = async () => {
	if (commandWorkingDirectory !== undefined) return commandWorkingDirectory;
	const wrapperCore = await thread.require<CoreExports>("@spookelton/serverWrapper");
	return (commandWorkingDirectory = (await wrapperCore.settings()).commandWorkingDirectory);
};

let worldFolder: string;
export const getWorldFolder = async () => {
	if (worldFolder !== undefined) return worldFolder;
	const properties = await getProperties();
	return (worldFolder = `${(await getCommandWorkingDirectory()) || "."}/${properties?.["level-name"]}`);
};

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

// async function getSpawn() {
// 	return new Promise(function (resolve, reject) {
// 		(async () => {
// 			let levelName = await modul.call("properties", "getProperty", "level-name").catch((err) => reject(err));
// 			let serverWorldFolder = levelName ? levelName : "Cookies";
// 			fs.readFile(`${serverWorldFolder}/level.dat`, function (err, data) {
// 				if (err) reject(err);
// 				else
// 					zlib.gunzip(data, async (err, buffer) => {
// 						if (err) reject(err);
// 						let levelData = await modul.getObj(NbtReader.readTag(buffer).val, "name", "Data");
// 						let worldSpawn = {};
// 						worldSpawn.x = (await modul.getObj(levelData.val, "name", "SpawnX")).val;
// 						worldSpawn.y = (await modul.getObj(levelData.val, "name", "SpawnY")).val;
// 						worldSpawn.z = (await modul.getObj(levelData.val, "name", "SpawnZ")).val;
// 						resolve(worldSpawn);
// 					});
// 			});
// 		})();
// 	});
// }
