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

export type PlayerColorName =
	| "Blue"
	| "Red"
	| "Green"
	| "Yellow"
	| "Aqua"
	| "Purple"
	| "Grey"
	| "Orange"
	| "White";

export type PlayerUIElement =
	| "Text"
	| "TextOutline"
	| "Icons"
	| "HealthBar"
	| "TimelineDark"
	| "TimelineLight"
	| "MiniMap"
	| "TechtreePreviewCiv";

export type UIRGBA = [number, number, number, number];

export type PlayerUIColors = Record<PlayerUIElement, UIRGBA>;

export type ColorTables = Record<PlayerColorName, PlayerUIColors>;

export interface UIColors {
	PresetColors: {
		ScoreInfoText: [213, 213, 213, 255];
	};
	ColorTables: ColorTables;
}
