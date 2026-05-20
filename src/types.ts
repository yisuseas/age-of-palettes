export type PlayerName = "Gaia" | `Player ${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

interface ColorJSON {
	FloatRGBA: {
		r: number;
		g: number;
		b: number;
		a: number;
	};
}

type PlayerColors = Record<PlayerName, ColorJSON>;

export interface SpriteColors {
	TeamColors: PlayerColors;
	OutlineColors: PlayerColors;
}

export type ColorEditor = "picker" | "hex" | "rgb" | "hsv" | "hsl";

export interface ViewProps {
	bg: string;
	fg: string;
}
