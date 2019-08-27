const moment = require("moment");

module.exports.getDuration = function getDuration(startTime, endTime) {
	startTime = moment(startTime);
	endTime = moment(endTime);
	let duration = moment.duration(endTime.diff(startTime));
	let t = {
		ms: duration.milliseconds(),
		s: duration.seconds(),
		m: duration.minutes(),
		h: duration.hours()
	}
	t.ms = t.ms||1; // Make sure we dont have no time passed
	return `${(t.m>0) ? `${t.m}min, ` : ''}${(t.s>0) ? `${t.s}sec, ` : ''}${(t.ms>0) ? `${t.ms}ms` : ''}`;
}