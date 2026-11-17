import type { ColorInstance } from "color";
import type {
	UIColors,
	SpriteColors,
	Palette,
	PlayerName,
	PlayerProperty,
	ColorDefSprite,
	ColorDefUI,
	PalettePlayer,
} from "../types.ts";
import defaultSPC from "../defaults/spritecolors.json";
import defaultUIC from "../defaults/UIColors.json";
import Color from "color";
import {
	PLAYER_NAME_UI_MAP,
	PLAYER_NAMES,
	PLAYER_PROPERTIES,
	PLAYER_PROPERTIES_UI,
} from "../constant.ts";
import { objectFromEntries } from "../utils.ts";

// From ColorInstance to:
//		* ColorDefSprite
//		* ColorDefUI
//	Create ColorInstance from:
//		* ColorDefSprite
//		* ColorDefUI

/**
 * Create a ColorDefSprite object from a ColorInstance.
 */
function spriteFromColor(color: ColorInstance): ColorDefSprite {
	const [r, g, b] = color
		.rgb()
		.array()
		.map((n) => n / 255);
	return {
		FloatRGBA: { r, g, b, a: 1.0 },
	};
}

/**
 * Create a ColorDefUI object from a ColorInstance.
 */
function uiFromColor(color: ColorInstance): ColorDefUI {
	const [r, g, b] = color
		.rgb()
		.array()
		.map((n) => Math.round(n));
	return [r, g, b, 255];
}

/**
 * Create a ColorInstance from a ColorDefSprite.
 */
function colorFromSprite({ FloatRGBA: { r, g, b } }: ColorDefSprite): ColorInstance {
	return Color.rgb(r * 255, g * 255, b * 255);
}

/**
 * Create a ColorInstance object from a ColorDefUI.
 */
function colorFromUI([r, g, b]: ColorDefUI): ColorInstance {
	return Color.rgb(r, g, b);
}

// From Palette to:
//		* UIColors + SpriteColors
//		* string
// Create Palette from:
//		* UIColors + SpriteColors
//		* string

function defaultColor(playerName: PlayerName, property: PlayerProperty): ColorInstance {
	if (property === "Unit") {
		const og = defaultSPC.TeamColors[playerName];
		return colorFromSprite(og);
	}
	if (property === "UnitOutline") {
		const og = defaultSPC.OutlineColors[playerName];
		return colorFromSprite(og);
	}
	const playerNameUI = PLAYER_NAME_UI_MAP[playerName];
	const og = defaultUIC.ColorTables[playerNameUI][property] as ColorDefUI;
	return colorFromUI(og);
}

/**
 * Create a new Palette object from the default values in the game.
 */
export function defaultPalette(): Palette {
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

/**
 * Create the two objects to be saved as json files for the game.
 */
export function paletteJSON(palette: Palette): [SpriteColors, UIColors] {
	const spriteColors: SpriteColors = {
		TeamColors: objectFromEntries(
			PLAYER_NAMES.map((playerName) => [
				playerName,
				spriteFromColor(palette[playerName].Unit),
			])
		),
		OutlineColors: objectFromEntries(
			PLAYER_NAMES.map((playerName) => [
				playerName,
				spriteFromColor(palette[playerName].UnitOutline),
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
						uiFromColor(palette[playerName][property]),
					])
				),
			])
		),
	};
	return [spriteColors, uiColors];
}

/**
 * Represent the Palette object as a URL safe base64 encoded string.
 */
export function encode(palette: Palette): string {
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
	});
}

const PALETTE_BYTE_LENGTH = PLAYER_NAMES.length * PLAYER_PROPERTIES.length * 3;

/**
 * Decode the base64 string if it represents a valid Palette object.
 */
export function decode(encoded: string): Palette | null {
	// @ts-expect-error
	const bytes = Uint8Array.fromBase64(encoded, {
		alphabet: "base64url",
	}) as Uint8Array;

	if (bytes.length !== PALETTE_BYTE_LENGTH) {
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
}
