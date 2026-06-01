import type { ColorInstance } from "color";
import Color from "color";
import type {
	ColorJSON,
	PlayerName,
	PlayerUIColors,
	UIRGBA,
	ViewProps,
} from "../types";
import defaultColors from "../spritecolors.json";

const WHITE = new Color("white").toString();
const BLACK = new Color("black").toString();

const LIGHT_DARK_RATIO = 0.15;

function uiColor(color: ColorInstance, alpha = 255): UIRGBA {
	const [r, g, b] = color
		.rgb()
		.array()
		.map((n) => Math.round(n));
	return [r, g, b, alpha];
}

export class PlayerModel {
	unit: ColorInstance;

	private constructor(color: ColorInstance) {
		this.unit = color;
	}

	static fromString(str: string) {
		const color = new Color(`#${str}`);
		return new PlayerModel(color);
	}

	static fromDefault(name: PlayerName) {
		const original = defaultColors.TeamColors[name].FloatRGBA;
		const color = Color.rgb(
			original.r * 255,
			original.g * 255,
			original.b * 255
		);
		return new PlayerModel(color);
	}

	playerColors(): ColorJSON {
		const [r, g, b] = this.unit
			.rgb()
			.array()
			.map((n) => n / 255);
		return {
			FloatRGBA: { r, g, b, a: 1.0 },
		};
	}

	uiColors(): PlayerUIColors {
		const base = uiColor(this.unit);
		const darker = uiColor(new Color(this.unit).darken(LIGHT_DARK_RATIO));
		const lighter = uiColor(new Color(this.unit).lighten(LIGHT_DARK_RATIO));
		const textOutline: UIRGBA = this.unit.isLight()
			? [0, 0, 0, 255]
			: [255, 255, 255, 128];
		return {
			Text: base,
			TextOutline: textOutline,
			Icons: base,
			HealthBar: base,
			TimelineDark: darker,
			TimelineLight: lighter,
			MiniMap: base,
			TechtreePreviewCiv: base,
		};
	}

	background() {
		return this.unit.toString();
	}

	foreground() {
		return this.unit.isLight() ? BLACK : WHITE;
	}

	hexString() {
		return this.unit.hex().replace("#", "");
	}

	set(unit: ColorInstance) {
		this.unit = unit;
	}

	props(): ViewProps {
		return {
			bg: this.background(),
			fg: this.foreground(),
		};
	}
}
