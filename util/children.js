const children = require('child_process');

module.exports.pExec = function pExec(args) {
	return new Promise((resolve, reject) => {
		children.exec(args, (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	})
}