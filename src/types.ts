import type { ColorInstance } from "color";
import type { PlayerModel } from "./Models/PlayerModel";

export type PlayerName = "Gaia" | `Player ${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

export interface ColorDefSprite {
	FloatRGBA: {
		r: number;
		g: number;
		b: number;
		a: number;
	};
}

export type SpriteColorMap = Record<PlayerName, ColorDefSprite>;

export interface SpriteColors {
	TeamColors: SpriteColorMap;
	OutlineColors: SpriteColorMap;
}

export type PlayerNameUI =
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

export type ColorDefUI = [number, number, number, number];

export type PlayerColorUI = Record<PlayerUIElement, ColorDefUI>;

export type ColorTableMap = Record<PlayerNameUI, PlayerColorUI>;

export interface UIColors {
	PresetColors: {
		ScoreInfoText: [213, 213, 213, 255];
	};
	ColorTables: ColorTableMap;
}

export type PlayerProperty = "Unit" | "UnitOutline" | PlayerUIElement;

export type ColorInput = "picker" | "hex" | "rgb" | "hsv" | "hsl";

export type PalettePlayer = Record<PlayerProperty, ColorInstance>;

export type Palette = Record<PlayerName, PalettePlayer>;

export type Channel = "r" | "g" | "b" | "h" | "s" | "v" | "l";

/* Events */

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
