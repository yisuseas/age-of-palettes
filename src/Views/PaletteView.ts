import type { PlayerName, ViewProps } from "../types";

export class PaletteView {
	playerList: HTMLUListElement;
	previewAll: HTMLDivElement;

	constructor() {
		this.playerList = document.querySelector("ul#player-list")!;
		this.previewAll = document.querySelector("div#preview-all")!;
	}

	private getImg(name: PlayerName) {
		return this.previewAll.querySelector(
			`img[name="${name}"]`
		) as HTMLImageElement;
	}

	render(name: PlayerName, props: ViewProps, isSelected: boolean) {
		const li = document.getElementById(name)!;
		li.style.cssText = `--bg:${props.bg};--fg:${props.fg};`;
		if (isSelected) {
			li.classList.add("selected");
		} else {
			li.classList.remove("selected");
		}
		this.getImg(name).style.backgroundColor = props.bg;
	}

	renderAll(entries: [PlayerName, ViewProps][], selected: PlayerName | null) {
		entries.forEach(([name, props]) => {
			this.render(name, props, selected === name);
		});
	}
}
