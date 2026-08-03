import type { ColorInstance } from "color";
import type {
	ColorDefSprite,
	ColorDefUI,
	Palette,
	PalettePlayer,
	PlayerName,
	PlayerProperty,
	SpriteColors,
	UIColors,
} from "../types";
import Color from "color";
import JSZip from "jszip";
import defaultSPC from "../defaults/spritecolors.json";
import defaultUIC from "../defaults/UIColors.json";
import {
	PLAYER_NAME_UI_MAP,
	PLAYER_NAMES,
	PLAYER_PROPERTIES,
	PLAYER_PROPERTIES_UI,
} from "../constant";
import { objectFromEntries } from "../utils";

const colorConvert = {
	from: {
		spriteColor({ FloatRGBA: { r, g, b } }: ColorDefSprite): ColorInstance {
			return Color.rgb(r * 255, g * 255, b * 255);
		},
		uiColor([r, g, b]: ColorDefUI): ColorInstance {
			return Color.rgb(r, g, b);
		},
	},
	to: {
		spriteColor(color: ColorInstance): ColorDefSprite {
			const [r, g, b] = color
				.rgb()
				.array()
				.map((n) => n / 255);
			return {
				FloatRGBA: { r, g, b, a: 1.0 },
			};
		},
		uiColor(color: ColorInstance): ColorDefUI {
			const [r, g, b] = color
				.rgb()
				.array()
				.map((n) => Math.round(n));
			return [r, g, b, 255];
		},
	},
};

function defaultColor(playerName: PlayerName, property: PlayerProperty): ColorInstance {
	if (property === "Unit") {
		const og = defaultSPC.TeamColors[playerName];
		return colorConvert.from.spriteColor(og);
	}
	if (property === "UnitOutline") {
		const og = defaultSPC.OutlineColors[playerName];
		return colorConvert.from.spriteColor(og);
	}
	const playerNameUI = PLAYER_NAME_UI_MAP[playerName];
	const og = defaultUIC.ColorTables[playerNameUI][property] as ColorDefUI;
	return colorConvert.from.uiColor(og);
}

function defaultPalette(): Palette {
	return objectFromEntries(
		PLAYER_NAMES.map<[PlayerName, PalettePlayer]>((playerName) => [
			playerName,
			objectFromEntries(
				PLAYER_PROPERTIES.map<[PlayerProperty, ColorInstance]>((property) => [
					property,
					defaultColor(playerName, property),
				])
			),
		])
	);
}

const b64 = {
	toBase64(palette: Palette): string {
		const bytes = new Uint8Array(
			PLAYER_NAMES.flatMap((playerName) =>
				PLAYER_PROPERTIES.flatMap((property) =>
					palette[playerName][property].rgb().array()
				)
			)
		);
		// @ts-expect-error
		return bytes.toBase64({
			omitPadding: true,
			alphabet: "base64url",
		}) as string;
	},
	byteLength: PLAYER_NAMES.length * PLAYER_PROPERTIES.length * 3,
	fromBase64(encoded: string): Palette | null {
		// @ts-expect-error
		const bytes = Uint8Array.fromBase64(encoded, {
			alphabet: "base64url",
		}) as Uint8Array;

		if (bytes.length !== this.byteLength) {
			return null;
		}
		return objectFromEntries(
			PLAYER_NAMES.map((playerName, playerIdx) => {
				const playerStart = playerIdx * PLAYER_PROPERTIES.length * 3;
				return [
					playerName,
					objectFromEntries(
						PLAYER_PROPERTIES.map((property, propertyIdx) => {
							const propertyStart = playerStart + propertyIdx * 3;
							return [
								property,
								Color.rgb(
									bytes[propertyStart],
									bytes[propertyStart + 1],
									bytes[propertyStart + 2]
								),
							];
						})
					),
				];
			})
		);
	},
};

const SEARCH_KEY = "palette";

export default class AppModel {
	private palette: Palette;

	constructor() {
		const searchParams = new URLSearchParams(window.location.search);
		const data = searchParams.get(SEARCH_KEY);
		this.palette = (data && b64.fromBase64(data)) || defaultPalette();
	}

	private updateURL(): void {
		const data = b64.toBase64(this.palette);
		const url = new URL(window.location.toString());
		url.searchParams.set(SEARCH_KEY, data);
		history.replaceState(null, "", url);
	}

	modData(modTitle = "MyPalette"): Promise<Blob> {
		const spriteColors: SpriteColors = {
			TeamColors: objectFromEntries(
				PLAYER_NAMES.map((playerName) => [
					playerName,
					colorConvert.to.spriteColor(this.palette[playerName].Unit),
				])
			),
			OutlineColors: objectFromEntries(
				PLAYER_NAMES.map((playerName) => [
					playerName,
					colorConvert.to.spriteColor(this.palette[playerName].UnitOutline),
				])
			),
		};
		const uiColors: UIColors = {
			PresetColors: {
				ScoreInfoText: [213, 213, 213, 255],
			},
			ColorTables: objectFromEntries(
				PLAYER_NAMES.map((playerName) => [
					PLAYER_NAME_UI_MAP[playerName],
					objectFromEntries(
						PLAYER_PROPERTIES_UI.map((property) => [
							property,
							colorConvert.to.uiColor(this.palette[playerName][property]),
						])
					),
				])
			),
		};

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
}
