const children = require('child_process');

module.exports.pExec = function pExec(args, options={}) {
	return new Promise((resolve, reject) => {
		children.exec(args, options, (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	})
}