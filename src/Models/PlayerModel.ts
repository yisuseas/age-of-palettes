import type { ColorInstance } from "color";
import type {
	ColorDefSprite,
	PlayerName,
	PlayerProperty,
	PlayerColorUI,
	PlayerUIElement,
	ColorDefUI,
	ViewProps,
} from "../types";
import Color from "color";
import defaultSpriteColors from "../defaults/spritecolors.json";
import defaultUIColors from "../defaults/UIColors.json";
import { PLAYER_PROPERTIES, PLAYER_NAME_UI_MAP } from "../constant";

const WHITE = new Color("white").toString();
const BLACK = new Color("black").toString();

function uiColor(color: ColorInstance, alpha = 255): ColorDefUI {
	const [r, g, b] = color
		.rgb()
		.array()
		.map((n) => Math.round(n));
	return [r, g, b, alpha];
}

const ALL_PLAYER_UI_ELEMENTS: PlayerUIElement[] = [
	"Text",
	"TextOutline",
	"Icons",
	"HealthBar",
	"TimelineDark",
	"TimelineLight",
	"MiniMap",
	"TechtreePreviewCiv",
];

export class PlayerModel implements Record<PlayerProperty, ColorInstance> {
	Unit: ColorInstance;
	UnitOutline: ColorInstance;
	Text: ColorInstance;
	TextOutline: ColorInstance;
	Icons: ColorInstance;
	HealthBar: ColorInstance;
	TimelineDark: ColorInstance;
	TimelineLight: ColorInstance;
	MiniMap: ColorInstance;
	TechtreePreviewCiv: ColorInstance;

	private constructor(data: Record<PlayerProperty, ColorInstance>) {
		this.Unit = data.Unit;
		this.UnitOutline = data.UnitOutline;
		this.Text = data.Text;
		this.TextOutline = data.TextOutline;
		this.Icons = data.Icons;
		this.HealthBar = data.HealthBar;
		this.TimelineDark = data.TimelineDark;
		this.TimelineLight = data.TimelineLight;
		this.MiniMap = data.MiniMap;
		this.TechtreePreviewCiv = data.TechtreePreviewCiv;
	}

	static fromString(str: string) {
		const list = str.split(SWATCH_SEPARATOR);
		return new PlayerModel(
			Object.fromEntries(
				PLAYER_PROPERTIES.map((swatch, idx) => [swatch, new Color(`#${list[idx]}`)])
			) as Record<PlayerProperty, ColorInstance>
		);
	}

	static fromDefault(name: PlayerName) {
		const fromFloatRGBA = ({ FloatRGBA: { r, g, b } }: ColorDefSprite) =>
			Color.rgb(r * 255, g * 255, b * 255);

		const colorTable = defaultUIColors.ColorTables[PLAYER_NAME_UI_MAP[name]];
		const fromUIRGBA = ([r, g, b]: number[]) => Color.rgb(r, g, b);

		return new PlayerModel({
			Unit: fromFloatRGBA(defaultSpriteColors.TeamColors[name]),
			UnitOutline: fromFloatRGBA(defaultSpriteColors.OutlineColors[name]),
			Text: fromUIRGBA(colorTable.Text),
			TextOutline: fromUIRGBA(colorTable.TextOutline),
			Icons: fromUIRGBA(colorTable.Icons),
			HealthBar: fromUIRGBA(colorTable.HealthBar),
			TimelineDark: fromUIRGBA(colorTable.TimelineDark),
			TimelineLight: fromUIRGBA(colorTable.TimelineLight),
			MiniMap: fromUIRGBA(colorTable.MiniMap),
			TechtreePreviewCiv: fromUIRGBA(colorTable.TechtreePreviewCiv),
		});
	}

	colorJSON(): [ColorDefSprite, ColorDefSprite] {
		return (["Unit", "UnitOutline"] as const).map((key) => {
			const [r, g, b] = this[key]
				.rgb()
				.array()
				.map((n) => n / 255);
			return {
				FloatRGBA: { r, g, b, a: 1.0 },
			};
		}) as [ColorDefSprite, ColorDefSprite];
	}

	uiColors(): PlayerColorUI {
		return Object.fromEntries(
			ALL_PLAYER_UI_ELEMENTS.map((swatch) => [swatch, uiColor(this[swatch])])
		) as PlayerColorUI;
	}

	background() {
		return this.Unit.toString();
	}

	foreground() {
		return this.Unit.isLight() ? BLACK : WHITE;
	}

	toString() {
		return PLAYER_PROPERTIES.map((swatch) => this[swatch].hex().replace("#", "")).join(
			SWATCH_SEPARATOR
		);
	}

	set(swatch: PlayerProperty, color: ColorInstance) {
		this[swatch] = color;
	}

	props(): ViewProps {
		return {
			bg: this.background(),
			fg: this.foreground(),
		};
	}

	getSwatches() {
		return PLAYER_PROPERTIES.map((swatch) => this[swatch].toString());
	}
}
