import Color from "color";
import { PlayerModel } from "../Models/PlayerModel";
import type { PlayerView } from "../Views/PlayerView";
import type { PlayerName } from "../types";

export class PlayerController {
	model: PlayerModel;
	view: PlayerView;

	constructor(model: PlayerModel, view: PlayerView) {
		this.model = model;
		this.view = view;
	}

	run() {
		this.render("Player 1");
		this.bindEvents();
	}

	private render(name: PlayerName) {
		this.view.render(name, this.model.unit);
	}

	private bindEvents() {
		this.view.picker.addEventListener("input", () => {
			const newColor = new Color(this.view.picker.value);
			this.model.set(newColor);
		});
	}
}
