import Color, { type ColorInstance } from "color";
import type { PlayerView } from "../Views/PlayerView";
import type { ColorInput, EventMap, PlayerName, PlayerProperty } from "../types";
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
	selectedSwatch: PlayerProperty | null;

	constructor(model: PlayerModel, view: PlayerView, app: App) {
		this.model = model;
		this.view = view;
		this.app = app;
		this.selectedSwatch = null;
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
		this.view.renderEditor(name, this.model.Unit);
		this.view.renderSwatchSelect(this.model.getSwatches(), this.selectedSwatch);
	}

	private bindEvents() {
		const updateColor = (newColor: ColorInstance, skip?: ColorInput) => {
			this.model.set("Unit", newColor);
			this.view.updateEditor(newColor, skip);
			this.view.updateSwatchSelect(this.selectedSwatch!, newColor.toString(), true);
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

				const handleInput = () => {
					const value = validate(inputElement.value, channel);
					if (typeof value !== "number") return;
					const clone = this.model.Unit[space]().object();
					clone[channel] = value;
					updateColor(new Color(clone), space);
				};

				inputElement.addEventListener("input", () => handleInput());

				const controls = inputElement.nextElementSibling;
				controls?.querySelector("button.increase")?.addEventListener("click", () => {
					inputElement.stepUp();
					handleInput();
				});
				controls?.querySelector("button.decrease")?.addEventListener("click", () => {
					inputElement.stepDown();
					handleInput();
				});
			});
		});
	}
}
