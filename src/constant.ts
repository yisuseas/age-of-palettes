import type { PlayerName } from "./types";

export const ALL_PLAYER_NAMES = Array.from({ length: 9 }, (_, idx) =>
	idx < 8 ? `Player ${idx + 1}` : "Gaia"
) as PlayerName[];
