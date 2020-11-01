const request = require('request');

module.exports.pRequestGet = function pRequestGet(requestObj) {
	return new Promise((resolve, reject) => {
		request.get(requestObj, (err, res, data) => {
			if (err) reject(err);
			resolve(data);
		})
	})
}