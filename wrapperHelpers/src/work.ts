import fs from "fs";
import path from "path";

const reqRegex = /require\(\"(.*?)\"\)/g;

console.log("Patching files...");

const references = require("../../tsconfig.json").references;
for (const { path: refPath } of Object.values<{ path: string }>(references)) {
	for (const file of listFiles(`${refPath}/dist`).filter((file) => file.endsWith(".js"))) {
		if (file === "./wrapperHelpers/dist/work.js") continue;
		fs.writeFileSync(
			file,
			fs
				.readFileSync(file, "utf8")
				.replaceAll("@spookelton/wrapperHelpers/modul", "@spookelton/wrapperHelpers/dist/modul")
				.replaceAll("@spookelton/wrapperHelpers/colors", "@spookelton/wrapperHelpers/dist/colors")
		);
	}
}
// takes a folder and recursively lists all files
function listFiles(folder: string): string[] {
	let files: string[] = [];
	for (const file of fs.readdirSync(folder)) {
		const filePath = `${folder}/${file}`;
		if (fs.lstatSync(filePath).isDirectory()) files.push(...listFiles(filePath));
		else files.push(filePath);
	}
	return files;
}
