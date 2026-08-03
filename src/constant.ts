import type {
	PlayerNameUI,
	PlayerName,
	PlayerProperty,
	PlayerUIElement,
	Channel,
} from "./types";

export const PLAYER_NAMES = Array.from({ length: 9 }, (_, idx) =>
	idx < 8 ? `Player ${idx + 1}` : "Gaia"
) as ReadonlyArray<PlayerName>;

export const PLAYER_PROPERTIES_UI: ReadonlyArray<PlayerUIElement> = [
	"Text",
	"TextOutline",
	"Icons",
	"HealthBar",
	"TimelineDark",
	"TimelineLight",
	"MiniMap",
	"TechtreePreviewCiv",
];

export const PLAYER_PROPERTIES: ReadonlyArray<PlayerProperty> = [
	"Unit",
	"UnitOutline",
	...PLAYER_PROPERTIES_UI,
];

export const PLAYER_NAME_UI_MAP: Readonly<Record<PlayerName, PlayerNameUI>> = {
	"Player 1": "Blue",
	"Player 2": "Red",
	"Player 3": "Green",
	"Player 4": "Yellow",
	"Player 5": "Aqua",
	"Player 6": "Purple",
	"Player 7": "Grey",
	"Player 8": "Orange",
	Gaia: "White",
};

export const MAX_CHANNEL_VALUE: Readonly<Record<Channel, number>> = {
	r: 255,
	g: 255,
	b: 255,
	h: 360,
	s: 100,
	v: 100,
	l: 100,
};

export const MULTI_CHANNEL_SPACES = ["rgb", "hsv", "hsl"] as const;
