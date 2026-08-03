import type {
	ColorTableMap,
	SpriteColorMap,
	PlayerName,
	SpriteColors,
	UIColors,
	ViewProps,
} from "../types";
import JSZip from "jszip";
import { PlayerModel } from "./PlayerModel";
import { PLAYER_NAMES, PLAYER_NAME_UI_MAP } from "../constant";

const SEARCH_KEY = "palette";

export class PaletteModel {
	playerData: Record<PlayerName, PlayerModel>;

	constructor() {
		const search = new URLSearchParams(window.location.search);
		const urlPalette = search.get(SEARCH_KEY);
		let genPlayerModel: (name: PlayerName, idx: number) => PlayerModel;

		if (urlPalette && PALETTE_RE.test(urlPalette)) {
			const hexColors = urlPalette.split(PLAYER_SEPARATOR);
			genPlayerModel = (_name, idx) => PlayerModel.fromString(hexColors[idx]);
		} else {
			genPlayerModel = (name, _idx) => PlayerModel.fromDefault(name);
		}

		this.playerData = Object.fromEntries(
			PLAYER_NAMES.map((name, idx) => [name, genPlayerModel(name, idx)])
		) as Record<PlayerName, PlayerModel>;
	}

	updateURL() {
		const searchValue = PLAYER_NAMES.map((name) =>
			this.playerData[name].toString()
		).join(PLAYER_SEPARATOR);
		const url = new URL(window.location.toString());
		url.searchParams.set(SEARCH_KEY, searchValue);
		history.replaceState(null, "", url);
	}

	getAll(): [PlayerName, ViewProps][] {
		return PLAYER_NAMES.map((name) => [name, this.playerData[name].props()]);
	}

	private getFileDataSprite() {
		const unitColors: Partial<SpriteColorMap> = {};
		const outlineColors: Partial<SpriteColorMap> = {};
		PLAYER_NAMES.forEach((name) => {
			const [unit, outline] = this.playerData[name].colorJSON();
			unitColors[name] = unit;
			outlineColors[name] = outline;
		});
		const spriteColors: SpriteColors = {
			TeamColors: unitColors as SpriteColorMap,
			OutlineColors: outlineColors as SpriteColorMap,
		};
		return JSON.stringify(spriteColors);
	}

	private getFileDataUI() {
		const colorTables = Object.fromEntries(
			PLAYER_NAMES.map((name) => [
				PLAYER_NAME_UI_MAP[name],
				this.playerData[name].uiColors(),
			])
		) as ColorTableMap;
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
