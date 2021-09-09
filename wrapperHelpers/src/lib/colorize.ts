import chalk from "chalk";
import { mc } from "../colors";
import { ColorfulString, ColorKey } from "../types";

export const minecraft = (defaultColor?: ColorKey) => (value: ColorfulString) => {
	if (typeof value === "string") {
		if (defaultColor !== undefined) return { text: value, color: mc[defaultColor] };
		return { text: value };
	}
	const color = value[1] === undefined ? defaultColor : value[1];
	if (color !== undefined) return { text: value[0], color: mc[color] };
	return { text: value[0] };
};
export const console = (defaultColor?: ColorKey) => (value: ColorfulString) => {
	if (typeof value === "string") {
		if (defaultColor !== undefined) return chalk`{${defaultColor} ${value}}`;
		return value;
	}
	const color = value[1] === undefined ? defaultColor : value[1];
	if (color !== undefined) return chalk`{${color} ${value[0]}}`;
	return value[0];
};
