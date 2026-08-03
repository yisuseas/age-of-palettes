import type { ColorInstance } from "color";
import type { ColorInput, PlayerName, PlayerProperty } from "../types";
import { PLAYER_PROPERTIES } from "../constant";

export class PlayerView {
	editor: HTMLDivElement;
	title: HTMLHeadingElement;
	swatchList: HTMLUListElement;
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
	hsl: {
		h: HTMLInputElement;
		s: HTMLInputElement;
		l: HTMLInputElement;
	};
	preview: HTMLImageElement;

	constructor() {
		this.editor = document.querySelector("div#editor")!;
		this.title = this.editor.querySelector("h2")!;
		this.swatchList = document.querySelector("ul#swatch-list")!;
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
		this.hsl = {
			h: document.querySelector("input#hsl-h")!,
			s: document.querySelector("input#hsl-s")!,
			l: document.querySelector("input#hsl-l")!,
		};
		this.preview = document.querySelector("img#preview")!;
	}

	renderEditor(name: PlayerName, color: ColorInstance) {
		this.editor.classList.remove("hidden");
		this.title.textContent = name;
		this.updateEditor(color);
	}

	updateEditor(color: ColorInstance, skip?: ColorInput) {
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

		if (skip !== "hsl") {
			const [h, s, l] = color
				.hsl()
				.array()
				.map((n) => Math.round(n).toString());
			this.hsl.h.value = h;
			this.hsl.s.value = s;
			this.hsl.l.value = l;
		}

		this.preview.style.backgroundColor = color.toString();
	}

	renderSwatchSelect(btnBackgrounds: string[], selectedSwatch: PlayerProperty | null) {
		PLAYER_PROPERTIES.forEach((swatch, idx) => {
			this.updateSwatchSelect(swatch, btnBackgrounds[idx], selectedSwatch === swatch);
		});
	}

	updateSwatchSelect(swatch: PlayerProperty, background: string, isSelected: boolean) {
		const li = document.getElementById(swatch)!;
		if (isSelected) {
			li.classList.add("selected");
		} else {
			li.classList.remove("selected");
		}
		const btn = li.querySelector("button")!;
		btn.style.backgroundColor = background;
	}

	clear() {
		this.editor.classList.add("hidden");
	}
}
