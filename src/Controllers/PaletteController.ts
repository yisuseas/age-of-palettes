import { ALL_PLAYER_NAMES } from "../constant";
import type { PaletteModel } from "../Models/PaletteModel";
import type { PlayerName, ViewProps } from "../types";
import type { PaletteView } from "../Views/PaletteView";
import type { Mediator } from "../Mediator";

export class PaletteController {
	model: PaletteModel;
	view: PaletteView;
	mediator: Mediator;
	selectedPlayer: PlayerName | null;

	constructor(model: PaletteModel, view: PaletteView) {
		this.model = model;
		this.view = view;
		this.mediator = {} as unknown as Mediator;
		this.selectedPlayer = "Player 1";
	}

	setMediator(mediator: Mediator) {
		this.mediator = mediator;
	}

	run() {
		this.render();
		this.bindEvents();
	}

	render() {
		this.view.renderAll(this.model.getAll(), this.selectedPlayer);
	}

	private bindEvents() {
		const previewAll = document.getElementById("preview-all")!;
		ALL_PLAYER_NAMES.forEach((name, idx) => {
			const handleClick = () => {
				this.toggleSelected(name);
				this.render();
			};
			const li = document.getElementById(name)!;
			const btn = li.querySelector("button")!;
			btn.addEventListener("click", handleClick);
			const img = previewAll.children[idx];
			img.addEventListener("click", handleClick);
		});
	}

	private toggleSelected(toggledName: PlayerName) {
		const name = this.selectedPlayer !== toggledName ? toggledName : null;
		this.selectedPlayer = name;
		const payload = name
			? { name, model: this.model.playerData[name] }
			: null;
		this.mediator.dispatch("change-player", payload);
	}

	updateSwatch(props: ViewProps) {
		this.model.updateURL();
		this.view.render(this.selectedPlayer!, props, true);
	}
}
