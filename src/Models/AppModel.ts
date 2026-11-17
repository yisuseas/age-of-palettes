import type { ColorInstance } from "color";
import type {
	Palette,
	PalettePlayer,
	PlayerName,
	PlayerProperty,
	PreviewAllColorMap,
} from "../types";
import JSZip from "jszip";
import { PLAYER_NAMES } from "../constant";
import { objectFromEntries } from "../utils";
import { decode, encode, defaultPalette, paletteJSON } from "./conversion";

const SEARCH_KEY = "palette";

export default class AppModel {
	private palette: Palette;

	constructor() {
		const searchParams = new URLSearchParams(window.location.search);
		const data = searchParams.get(SEARCH_KEY);
		this.palette = (data && decode(data)) || defaultPalette();
	}

	private updateURL(): void {
		const data = encode(this.palette);
		const url = new URL(window.location.toString());
		url.searchParams.set(SEARCH_KEY, data);
		history.replaceState(null, "", url);
	}

	modData(modTitle = "MyPalette"): Promise<Blob> {
		const [spriteColors, uiColors] = paletteJSON(this.palette);
		const zip = new JSZip();
		const dir = zip.folder(modTitle);
		if (!dir) {
			throw new Error("Failed to make main dir");
		}
		const info = JSON.stringify({
			Title: modTitle,
			Description: "Custom palette for player sprites & ui elements",
		});
		dir.file("info.json", info);
		dir.file("widgetui/UIColors.json", JSON.stringify(uiColors));
		dir.file(
			"resources/_common/palettes/spritecolors.json",
			JSON.stringify(spriteColors)
		);
		return zip.generateAsync({ type: "blob" });
	}

	getPlayer(playerName: PlayerName): Readonly<PalettePlayer> {
		return this.palette[playerName];
	}

	getColor(playerName: PlayerName, property: PlayerProperty): Readonly<ColorInstance> {
		return this.palette[playerName][property];
	}

	setColor(
		playerName: PlayerName,
		property: PlayerProperty,
		newColor: ColorInstance
	): void {
		this.palette[playerName][property] = newColor;
		this.updateURL();
	}

	getPreviewAllColors(): PreviewAllColorMap {
		return objectFromEntries(
			(["Unit", "UnitOutline"] as const).map((prop) => [
				prop,
				PLAYER_NAMES.map((playerName) => this.getColor(playerName, prop)),
			])
		);
	}
}
