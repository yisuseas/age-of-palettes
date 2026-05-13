import type { ColorInstance } from "color";
import type { PlayerName } from "../types";

export class PlayerView {
	editor: HTMLDivElement;
	title: HTMLHeadingElement;
	picker: HTMLInputElement;

	constructor() {
		this.editor = document.querySelector("div#editor")!;
		this.title = this.editor.querySelector("h2")!;
		this.picker = document.querySelector("input#picker")!;
	}

	render(name: PlayerName, color: ColorInstance) {
		this.editor.classList.remove("hidden");
		this.title.textContent = name;
		this.picker.value = color.hex();
	}

	clear() {
		this.editor.classList.add("hidden");
	}
}
