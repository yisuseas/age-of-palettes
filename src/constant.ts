import type { PlayerColorName, PlayerName } from "./types";

export const ALL_PLAYER_NAMES = Array.from({ length: 9 }, (_, idx) =>
	idx < 8 ? `Player ${idx + 1}` : "Gaia"
) as Readonly<PlayerName[]>;

export const PLAYER_COLOR_NAMES: Readonly<Record<PlayerName, PlayerColorName>> =
	{
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
