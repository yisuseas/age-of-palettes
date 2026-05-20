import type { ColorInstance } from "color";
import Color from "color";
import type { PlayerName, ViewProps } from "../types";
import defaultColors from "../spritecolors.json";

const WHITE = new Color("white").toString();
const BLACK = new Color("black").toString();

export class PlayerModel {
	unit: ColorInstance;

	constructor(hexStr: string) {
		this.unit = new Color(`#${hexStr}`);
	}

	static fromDefault(name: PlayerName) {
		const original = defaultColors.TeamColors[name].FloatRGBA;
		const color = Color.rgb(
			Math.round(original.r * 255),
			Math.round(original.g * 255),
			Math.round(original.b * 255)
		);
		return new PlayerModel(color.hex().replace("#", ""));
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
