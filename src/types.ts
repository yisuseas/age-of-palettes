import type { PlayerModel } from "./Models/PlayerModel";

export type PlayerName = "Gaia" | `Player ${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

export interface ColorJSON {
	FloatRGBA: {
		r: number;
		g: number;
		b: number;
		a: number;
	};
}

export type PlayerColors = Record<PlayerName, ColorJSON>;

export interface SpriteColors {
	TeamColors: PlayerColors;
	OutlineColors: PlayerColors;
}

export type ColorEditor = "picker" | "hex" | "rgb" | "hsv" | "hsl";

export interface ViewProps {
	bg: string;
	fg: string;
}

export type EventMap = {
	"change-player": {
		name: PlayerName;
		model: PlayerModel;
	} | null;

	"change-swatch": ViewProps;
};

export type EventName = keyof EventMap;
