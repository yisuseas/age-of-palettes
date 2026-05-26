import type {
	PlayerColors,
	PlayerName,
	SpriteColors,
	ViewProps,
} from "../types";
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
		let genPlayerModel: (name: PlayerName, idx: number) => PlayerModel;

		if (urlPalette && VALID_PATTERN.test(urlPalette)) {
			const hexColors = urlPalette.split(PLAYER_SEPARATOR);
			genPlayerModel = (_name, idx) =>
				PlayerModel.fromString(hexColors[idx]);
		} else {
			genPlayerModel = (name, _idx) => PlayerModel.fromDefault(name);
		}

		this.playerData = Object.fromEntries(
			ALL_PLAYER_NAMES.map((name, idx) => [name, genPlayerModel(name, idx)])
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
			this.playerData[name].props(),
		]);
	}

	getFileData() {
		const playerColors = Object.fromEntries(
			ALL_PLAYER_NAMES.map((name) => [
				name,
				this.playerData[name].playerColors(),
			])
		) as PlayerColors;
		const spriteColors: SpriteColors = {
			TeamColors: playerColors,
			OutlineColors: playerColors,
		};
		const jsonStr = JSON.stringify(spriteColors);
		const file = new Blob([jsonStr], { type: "text/plain" });
		return URL.createObjectURL(file);
	}
}
