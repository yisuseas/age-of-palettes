import { ALL_PLAYER_NAMES } from "../constant";
import type { PaletteModel } from "../Models/PaletteModel";
import type { PlayerName, ViewProps } from "../types";
import type { PaletteView } from "../Views/PaletteView";
import type { App } from "../App";

class ModKey {
	isPressed = false;

	constructor(isModKey: (event: KeyboardEvent) => boolean) {
		window.addEventListener("keydown", (event) => {
			if (isModKey(event)) {
				this.isPressed = true;
			}
		});
		window.addEventListener("keyup", (event) => {
			if (isModKey(event)) {
				this.isPressed = false;
			}
		});
	}
}

export class PaletteController {
	model: PaletteModel;
	view: PaletteView;
	app: App;
	selectedPlayer: PlayerName | null;

	constructor(model: PaletteModel, view: PaletteView, app: App) {
		this.model = model;
		this.view = view;
		this.app = app;
		this.selectedPlayer = null;
	}

	run() {
		this.render();
		this.view.renderDownload(this.model.getFileData());
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
			};
			const li = document.getElementById(name)!;
			const btn = li.querySelector("button")!;
			btn.addEventListener("click", handleClick);
			const img = previewAll.children[idx];
			img.addEventListener("click", handleClick);
		});

		const validPlayerCode = /^(Digit|Numpad)[1-9]$/;
		const keyPrefix = /Digit|Numpad/;
		const modKey = new ModKey((event) => event.code.startsWith("Shift"));

		window.addEventListener("keydown", (event) => {
			if (this.selectedPlayer && event.code === "Escape") {
				this.toggleSelected(this.selectedPlayer);
			} else if (modKey.isPressed && validPlayerCode.test(event.code)) {
				const idx = parseInt(event.code.replace(keyPrefix, "")) - 1;
				this.toggleSelected(ALL_PLAYER_NAMES[idx]);
			}
		});
	}

	private toggleSelected(toggledName: PlayerName) {
		const name = this.selectedPlayer !== toggledName ? toggledName : null;
		this.selectedPlayer = name;
		const payload = name
			? { name, model: this.model.playerData[name] }
			: null;
		this.app.dispatch("change-player", payload);
		this.render();
	}

	updateSwatch(props: ViewProps) {
		this.model.updateURL();
		this.view.render(this.selectedPlayer!, props, true);
		this.view.renderDownload(this.model.getFileData());
	}
}
