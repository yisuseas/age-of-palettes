import type { ColorInstance } from "color";
import type { ColorEditor, PlayerName } from "../types";

export class PlayerView {
	editor: HTMLDivElement;
	title: HTMLHeadingElement;
	picker: HTMLInputElement;
	hex: HTMLInputElement;
	rgb: {
		r: HTMLInputElement;
		g: HTMLInputElement;
		b: HTMLInputElement;
	};
	hsv: {
		h: HTMLInputElement;
		s: HTMLInputElement;
		v: HTMLInputElement;
	};

	constructor() {
		this.editor = document.querySelector("div#editor")!;
		this.title = this.editor.querySelector("h2")!;
		this.picker = document.querySelector("input#picker")!;
		this.hex = document.querySelector("input#hex")!;
		this.rgb = {
			r: document.querySelector("input#rgb-r")!,
			g: document.querySelector("input#rgb-g")!,
			b: document.querySelector("input#rgb-b")!,
		};
		this.hsv = {
			h: document.querySelector("input#hsv-h")!,
			s: document.querySelector("input#hsv-s")!,
			v: document.querySelector("input#hsv-v")!,
		};
	}

	render(name: PlayerName, color: ColorInstance) {
		this.editor.classList.remove("hidden");
		this.title.textContent = name;
		this.updateEditor(color);
	}

	updateEditor(color: ColorInstance, skip?: ColorEditor) {
		const hex = color.hex();
		if (skip !== "picker") {
			this.picker.value = hex;
		}
		if (skip !== "hex") {
			this.hex.value = hex;
		}

		if (skip !== "rgb") {
			const [r, g, b] = color
				.rgb()
				.array()
				.map((n) => Math.round(n).toString());
			this.rgb.r.value = r;
			this.rgb.g.value = g;
			this.rgb.b.value = b;
		}

		if (skip !== "hsv") {
			const [h, s, v] = color
				.hsv()
				.array()
				.map((n) => Math.round(n).toString());
			this.hsv.h.value = h;
			this.hsv.s.value = s;
			this.hsv.v.value = v;
		}
	}

	clear() {
		this.editor.classList.add("hidden");
	}
}
