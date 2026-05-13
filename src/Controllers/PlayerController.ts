import Color from "color";
import { PlayerModel } from "../Models/PlayerModel";
import type { PlayerView } from "../Views/PlayerView";
import type { PlayerName } from "../types";
import type { EventMap, Mediator } from "../Mediator";

export class PlayerController {
	model: PlayerModel;
	view: PlayerView;
	mediator: Mediator;

	constructor(model: PlayerModel, view: PlayerView) {
		this.model = model;
		this.view = view;
		this.mediator = {} as unknown as Mediator;
	}

	setMediator(mediator: Mediator) {
		this.mediator = mediator;
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
			this.mediator.dispatch("change-swatch", {
				cssProps: this.model.cssProps(),
			});
		});
	}
}
