declare module "colorthief" {
	export function getColor(image: string, quality?: number): Promise<[number, number, number]>;
	export function getPalette(image: string, colorCount?: number, quality?: number): Promise<[number, number, number][]>;
}
