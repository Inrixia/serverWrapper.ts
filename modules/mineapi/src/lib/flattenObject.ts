export const flattenObject = (ob: Record<string, any>) => {
	const toReturn: Record<string, any> = {};
	for (const key in ob) {
		if (typeof ob[key] == "object") {
			const flatObject = flattenObject(ob[key]);
			for (const flatKey in flatObject) {
				toReturn[key + "." + flatKey] = flatObject[flatKey];
			}
		} else toReturn[key] = ob[key];
	}
	return toReturn;
};
