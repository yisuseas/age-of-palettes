import { ALL_PLAYER_NAMES } from "../constant";
import type { PaletteModel } from "../Models/PaletteModel";
import type { PlayerName } from "../types";
import type { PaletteView } from "../Views/PaletteView";

export class PaletteController {
	model: PaletteModel;
	view: PaletteView;
	selectedPlayer: PlayerName | null;

	constructor(model: PaletteModel, view: PaletteView) {
		this.model = model;
		this.view = view;
		this.selectedPlayer = "Player 1";
	}

	run() {
		this.render();
		this.bindEvents();
	}

	render() {
		this.view.renderAll(this.model.getAll(), this.selectedPlayer);
	}

	private bindEvents() {
		ALL_PLAYER_NAMES.forEach((name) => {
			const li = document.getElementById(name)!;
			const btn = li.querySelector("button")!;
			btn.addEventListener("click", () => {
				this.toggleSelected(name);
				this.render();
			});
		});
	}

	private toggleSelected(toggledName: PlayerName) {
		const name = this.selectedPlayer !== toggledName ? toggledName : null;
		this.selectedPlayer = name;
	}

	updateSwatch(cssProps: string) {
		this.model.updateURL();
		this.view.render(this.selectedPlayer!, cssProps, true);
	}
}
