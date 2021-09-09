import * as fs from "fs";

const reqRegex = /require\(\"(.*?)\"\)/g;

console.log("Patching files...");

const references = require("../../tsconfig.json").references;
for (const { path } of Object.values<{ path: string }>(references)) {
	for (const file of listFiles(`${path}/dist`).filter((file) => file.endsWith(".js"))) {
		if (file === "./wrapperHelpers/dist/work.js") continue;
		// fs.unlink(file, () => {});
		let content = fs.readFileSync(file, "utf8");
		let match;
		let matches = [];
		while ((match = reqRegex.exec(content)) !== null) {
			matches.push(match);
			// This is necessary to avoid infinite loops with zero-width matches
			if (match.index === reqRegex.lastIndex) reqRegex.lastIndex++;
		}
		for (const match of matches) {
			match.map((matchString, groupIndex) => {
				if (groupIndex === 0 || matchString === "chalk" || matchString[0] === ".") return;
				const _path = file.slice(0, file.lastIndexOf("/"));
				try {
					content = content.replace(/\.require/g, "_____dotrequire______");
					content = content.replace(`require("${matchString}")`, `require("${require.resolve(matchString, { paths: [_path] }).replace(/\\/g, "\\\\")}")`);
					content = content.replace(/\_\_\_\_\_dotrequire\_\_\_\_\_\_/g, ".require");
				} catch (e) {
					console.log(e);
					console.log(file, matchString);
					process.exit();
				}
			});
		}
		fs.writeFileSync(file, content);
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
