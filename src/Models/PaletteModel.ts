import type { PlayerName, ViewProps } from "../types";
import { PlayerModel } from "./PlayerModel";
import { ALL_PLAYER_NAMES } from "../constant";

const SEARCH_KEY = "palette";

const PLAYER_SEPARATOR = "-";

const VALID_PATTERN = /^([\da-f]{6}-){8}[\da-f]{6}$/i;

export class PaletteModel {
	playerData: Record<PlayerName, PlayerModel>;

	constructor() {
		const search = new URLSearchParams(window.location.search);
		const urlPalette = search.get(SEARCH_KEY);
		let generatePlayerColors: (
			name: PlayerName,
			idx: number
		) => [PlayerName, PlayerModel];

		if (urlPalette && VALID_PATTERN.test(urlPalette)) {
			const hexColors = urlPalette.split(PLAYER_SEPARATOR);
			generatePlayerColors = (name, idx) => {
				const player = new PlayerModel(hexColors[idx]);
				return [name, player];
			};
		} else {
			generatePlayerColors = (name, _) => {
				const player = PlayerModel.fromDefault(name);
				return [name, player];
			};
		}

		this.playerData = Object.fromEntries(
			ALL_PLAYER_NAMES.map(generatePlayerColors)
		) as Record<PlayerName, PlayerModel>;
	}

	updateURL() {
		const searchValue = ALL_PLAYER_NAMES.map((name) =>
			this.playerData[name].hexString()
		).join(PLAYER_SEPARATOR);
		const url = new URL(window.location.toString());
		url.searchParams.set(SEARCH_KEY, searchValue);
		history.replaceState(null, "", url);
	}

	getAll(): [PlayerName, ViewProps][] {
		return ALL_PLAYER_NAMES.map((name) => [
			name,
			this.playerData[name].props()
		]);
	}
}
