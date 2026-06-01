import type {
	ColorTables,
	PlayerColors,
	PlayerName,
	SpriteColors,
	UIColors,
	ViewProps,
} from "../types";
import JSZip from "jszip";
import { PlayerModel } from "./PlayerModel";
import { ALL_PLAYER_NAMES, PLAYER_COLOR_NAMES } from "../constant";

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

	private getFileDataSprite() {
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
		return JSON.stringify(spriteColors);
	}

	private getFileDataUI() {
		const colorTables = Object.fromEntries(
			ALL_PLAYER_NAMES.map((name) => [
				PLAYER_COLOR_NAMES[name],
				this.playerData[name].uiColors(),
			])
		) as ColorTables;
		const uiColors: UIColors = {
			PresetColors: {
				ScoreInfoText: [213, 213, 213, 255],
			},
			ColorTables: colorTables,
		};
		return JSON.stringify(uiColors);
	}

	async getModData(title: string) {
		const zip = new JSZip();
		const mainFolder = zip.folder(title);
		if (!mainFolder) {
			throw new Error("Failed to make main folder");
		}

		const info = JSON.stringify({
			Title: title,
			Description: "Custom palette for player sprites & ui elements",
		});
		const sprite = this.getFileDataSprite();
		const ui = this.getFileDataUI();

		mainFolder.file("info.json", info);
		mainFolder.file("widgetui/UIColors.json", ui);
		mainFolder.file("resources/_common/palettes/spritecolors.json", sprite);

		const data = await zip.generateAsync({ type: "blob" });
		return URL.createObjectURL(data);
	}
}
