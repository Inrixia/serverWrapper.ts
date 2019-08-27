const fs = require('fs');

module.exports.pReadFile = function pReadFile(...args) {
	return new Promise((resolve, reject) => {
		fs.readFile(args, (err, data) => {
			if (err) reject(err);
			else resolve(data);
		})
	})
}

module.exports.pWriteFile = function pWriteFile(...args) {
	return new Promise((resolve, reject) => {
		fs.writeFile(args, (err) => {
			if (err) reject(err);
			else resolve();
		})
	})
}