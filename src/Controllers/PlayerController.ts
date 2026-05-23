import Color, { type ColorInstance } from "color";
import type { PlayerView } from "../Views/PlayerView";
import type { ColorEditor, EventMap, PlayerName } from "../types";
import type { App } from "../App";
import { PlayerModel } from "../Models/PlayerModel";

const VALID_HEX = /^\#[\da-f]{6}$/i;

const MAX_CHANNEL_VALUE = {
	r: 255,
	g: 255,
	b: 255,
	h: 360,
	s: 100,
	v: 100,
	l: 100,
} as const;

type Channel = keyof typeof MAX_CHANNEL_VALUE;

export class PlayerController {
	model: PlayerModel;
	view: PlayerView;
	app: App;

	constructor(model: PlayerModel, view: PlayerView, app: App) {
		this.model = model;
		this.view = view;
		this.app = app;
	}

	set(payload: EventMap["change-player"]) {
		if (payload) {
			this.model = payload.model;
			this.render(payload.name);
		} else {
			this.view.clear();
		}
	}

	run() {
		this.bindEvents();
	}

	private render(name: PlayerName) {
		this.view.render(name, this.model.unit);
	}

	private bindEvents() {
		const updateColor = (newColor: ColorInstance, skip?: ColorEditor) => {
			this.model.set(newColor);
			this.view.updateEditor(newColor, skip);
			this.app.dispatch("change-swatch", this.model.props());
		};

		this.view.picker.addEventListener("input", () => {
			const newColor = new Color(this.view.picker.value);
			updateColor(newColor, "picker");
		});

		this.view.hex.addEventListener("input", () => {
			const value = this.view.hex.value;
			if (!VALID_HEX.test(value)) return;
			const newColor = new Color(value);
			updateColor(newColor, "hex");
		});

		const validate = (str: string, channel: Channel) => {
			const int = parseInt(str);
			if (!isFinite(int)) return null;
			if (int < 0) return null;
			if (int > MAX_CHANNEL_VALUE[channel]) return null;
			return int;
		};

		(["rgb", "hsv", "hsl"] as const).forEach((space) => {
			(Array.from(space) as Channel[]).forEach((channel) => {
				// @ts-expect-error
				const inputElement = this.view[space][channel] as HTMLInputElement;

				inputElement.addEventListener("input", () => {
					const value = validate(inputElement.value, channel);
					if (typeof value !== "number") return;
					const clone = this.model.unit[space]().object();
					clone[channel] = value;
					updateColor(new Color(clone), space);
				});
			});
		});
	}
}
