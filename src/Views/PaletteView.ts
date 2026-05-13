import type { PlayerName } from "../types";

export class PaletteView {
	playerList: HTMLUListElement;

	constructor() {
		this.playerList = document.querySelector("ul#player-list")!;
	}

	render(name: PlayerName, cssProps: string, isSelected: boolean) {
		const li = document.getElementById(name)!;
		li.style.cssText = cssProps;
		if (isSelected) {
			li.classList.add("selected");
		} else {
			li.classList.remove("selected");
		}
	}

	renderAll(entries: [PlayerName, string][], selected: PlayerName | null) {
		entries.forEach(([name, cssProps]) => {
			this.render(name, cssProps, selected === name);
		});
	}
}
