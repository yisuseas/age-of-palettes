import type { ColorInstance } from "color";
import type {
	Channel,
	ColorInput,
	PalettePlayer,
	PlayerName,
	PlayerProperty,
	PreviewAllColorMap,
	PreviewAllProps,
	PreviewSingleProps,
} from "../types";
import {
	MAX_CHANNEL_VALUE,
	MULTI_CHANNEL_SPACES,
	PLAYER_NAMES,
	PLAYER_PROPERTIES,
} from "../constant";
import { getElementById, kebab } from "../utils";
import previewSrc from "../assets/preview-with-holes.png";

interface Coords {
	x: number;
	y: number;
	r: number;
}

interface BackgroundCoords {
	all: Record<PlayerName, Record<PreviewAllProps, Coords>>;
	single: Record<PreviewSingleProps, Coords>;
}

const BACKGROUND_COORDS: Readonly<BackgroundCoords> = {
	all: {
		"Player 1": { UnitOutline: { x: 93, y: 93, r: 70 }, Unit: { x: 93, y: 93, r: 68 } },
		"Player 2": {
			UnitOutline: { x: 256, y: 93, r: 70 },
			Unit: { x: 256, y: 93, r: 68 },
		},
		"Player 3": {
			UnitOutline: { x: 419, y: 93, r: 70 },
			Unit: { x: 419, y: 93, r: 68 },
		},
		"Player 4": {
			UnitOutline: { x: 93, y: 256, r: 70 },
			Unit: { x: 93, y: 256, r: 68 },
		},
		"Player 5": {
			UnitOutline: { x: 256, y: 256, r: 70 },
			Unit: { x: 256, y: 256, r: 68 },
		},
		"Player 6": {
			UnitOutline: { x: 419, y: 256, r: 70 },
			Unit: { x: 419, y: 256, r: 68 },
		},
		"Player 7": {
			UnitOutline: { x: 93, y: 419, r: 70 },
			Unit: { x: 93, y: 419, r: 68 },
		},
		"Player 8": {
			UnitOutline: { x: 256, y: 419, r: 70 },
			Unit: { x: 256, y: 419, r: 68 },
		},
		Gaia: { UnitOutline: { x: 419, y: 419, r: 70 }, Unit: { x: 419, y: 419, r: 68 } },
	},
	single: {
		Unit: { x: 93, y: 93, r: 70 },
		Text: { x: 256, y: 93, r: 70 },
		TextOutline: { x: 419, y: 93, r: 70 },
		Icons: { x: 93, y: 256, r: 70 },
		HealthBar: { x: 256, y: 256, r: 70 },
		TechtreePreviewCiv: { x: 419, y: 256, r: 70 },
		TimelineDark: { x: 93, y: 419, r: 70 },
		TimelineLight: { x: 256, y: 419, r: 70 },
		MiniMap: { x: 419, y: 419, r: 70 },
	},
};

const TAU = Math.PI * 2;

export default class AppView {
	playerList: HTMLUListElement;
	playerProperties: HTMLDivElement;
	propertyList: HTMLUListElement;
	editor: HTMLDivElement;
	editorInputs: HTMLDivElement;
	canvasCtx: CanvasRenderingContext2D;
	imgA: HTMLImageElement;
	imgB: HTMLImageElement;

	constructor() {
		this.playerList = getElementById<HTMLUListElement>("player-list");
		this.playerProperties = getElementById<HTMLDivElement>("player-properties");
		this.propertyList = getElementById<HTMLUListElement>("property-list");
		this.editor = getElementById<HTMLDivElement>("editor");
		this.editorInputs = getElementById<HTMLDivElement>("editor-inputs");
		const canvas = getElementById<HTMLCanvasElement>("preview-canvas");
		this.canvasCtx = canvas.getContext("2d")!;
		this.imgA = new Image();
		this.imgB = new Image();
	}

	initialRender(iconColors: ColorInstance[], previewColors: PreviewAllColorMap): void {
		this.renderAllPlayers(iconColors);
		this.renderAllProperties();
		this.renderInputs();
		this.renderPreview(previewColors);
	}

	private renderAllPlayers(iconColors: ColorInstance[]): void {
		const playerButton = getElementById<HTMLTemplateElement>("player-list-item");
		PLAYER_NAMES.forEach((playerName, playerIdx) => {
			const clone = document.importNode(playerButton.content, true);
			const btn = clone.querySelector("button")!;
			btn.id = kebab(playerName);
			btn.textContent = playerName.replace(/layer |aia/, "");
			const color = iconColors[playerIdx];
			btn.style.backgroundColor = color.toString();
			btn.classList.add(color.isDark() ? "dark" : "light");
			this.playerList.appendChild(clone);
		});
	}

	updatePlayer(playerName: PlayerName, color: ColorInstance): void {
		const btn = getElementById<HTMLButtonElement>(kebab(playerName));
		btn.style.backgroundColor = color.toString();
		if (color.isDark()) {
			btn.classList.replace("light", "dark");
		} else {
			btn.classList.replace("dark", "light");
		}
	}

	updateSelectedListItem<T extends PlayerName | PlayerProperty>(
		prev: T | null,
		next: T | null
	): void {
		if (prev) {
			const btn = getElementById<HTMLButtonElement>(kebab(prev));
			const li = btn.parentElement!;
			li.classList.remove("selected");
		}
		if (next) {
			const btn = getElementById<HTMLButtonElement>(kebab(next));
			const li = btn.parentElement!;
			li.classList.add("selected");
		}
	}

	private renderAllProperties(): void {
		const propertyButton = getElementById<HTMLTemplateElement>("property-list-item");
		PLAYER_PROPERTIES.forEach((propName) => {
			const clone = document.importNode(propertyButton.content, true);
			const btn = clone.querySelector("button")!;
			btn.id = kebab(propName);
			btn.textContent = propName;
			this.propertyList.appendChild(clone);
		});
	}

	updateProperty(propName: PlayerProperty, color: ColorInstance): void {
		const btn = getElementById<HTMLButtonElement>(kebab(propName));
		btn.style.cssText = `--prop: ${color.toString()};`;
	}

	showPlayerProperties(playerName: PlayerName, propColors: ColorInstance[]): void {
		const heading = this.playerProperties.querySelector("h2")!;
		heading.textContent = playerName;
		PLAYER_PROPERTIES.forEach((propName, propIdx) => {
			this.updateProperty(propName, propColors[propIdx]);
		});
		this.playerProperties.classList.remove("hidden");
	}

	hidePlayerProperties(): void {
		this.playerProperties.classList.add("hidden");
	}

	private renderInputs(): void {
		const inputRow = getElementById<HTMLTemplateElement>("number-input-row");
		const inputItem = getElementById<HTMLTemplateElement>("number-input-item");
		MULTI_CHANNEL_SPACES.forEach((space) => {
			const rowClone = document.importNode(inputRow.content, true);
			const span = rowClone.querySelector("span")!;
			span.textContent = space.toUpperCase();
			(space.split("") as Channel[]).forEach((channel) => {
				const itemClone = document.importNode(inputItem.content, true);
				const input = itemClone.querySelector("input")!;
				input.id = `${space}-${channel}`;
				input.max = MAX_CHANNEL_VALUE[channel].toString();
				const div = rowClone.querySelector("div")!;
				div.appendChild(itemClone);
			});
			this.editorInputs.appendChild(rowClone);
		});
	}

	updateEditor(color: ColorInstance, skip?: ColorInput): void {
		const hex = color.hex();
		if (skip !== "picker") {
			const input = getElementById<HTMLInputElement>("picker");
			input.value = hex;
		}
		if (skip !== "hex") {
			const input = getElementById<HTMLInputElement>("hex");
			input.value = hex;
		}
		MULTI_CHANNEL_SPACES.forEach((space) => {
			if (skip !== space) {
				const values = color[space]()
					.array()
					.map((n) => Math.round(n).toString());
				(space.split("") as Channel[]).forEach((channel, channelIdx) => {
					const input = getElementById<HTMLInputElement>(`${space}-${channel}`);
					input.value = values[channelIdx];
				});
			}
		});
	}

	showEditor(propName: PlayerProperty, color: ColorInstance): void {
		this.editor.classList.remove("hidden");
		const heading = this.editor.querySelector("h3")!;
		heading.textContent = propName;
		this.updateEditor(color);
	}

	hideEditor(): void {
		this.editor.classList.add("hidden");
	}

	private renderPreview(colors: PreviewAllColorMap): void {
		this.imgA.addEventListener("load", () => {
			this.updatePreviewAll(colors);
			console.log("imgA ready");
		});
		this.imgB.addEventListener("load", () => console.log("imgB ready"));
		this.imgA.src = previewSrc;
		this.imgB.src = previewSrc;
	}

	updatePreviewAll(colors: PreviewAllColorMap): void {
		PLAYER_NAMES.forEach((playerName, playerIdx) => {
			(["UnitOutline", "Unit"] as PreviewAllProps[]).forEach((property) => {
				const { r, x, y } = BACKGROUND_COORDS.all[playerName][property];
				this.canvasCtx.fillStyle = colors[property][playerIdx].toString();
				this.canvasCtx.beginPath();
				this.canvasCtx.arc(x, y, r, 0, TAU);
				this.canvasCtx.fill();
			});
		});
		this.canvasCtx.drawImage(this.imgA, 0, 0);
	}

	updatePreviewSingle(player: PalettePlayer): void {
		(
			[
				"Unit",
				"Text",
				"TextOutline",
				"Icons",
				"HealthBar",
				"TechtreePreviewCiv",
				"TimelineDark",
				"TimelineLight",
				"MiniMap",
			] as PreviewSingleProps[]
		).forEach((property) => {
			const { r, x, y } = BACKGROUND_COORDS.single[property];
			this.canvasCtx.fillStyle = player[property].toString();
			this.canvasCtx.beginPath();
			this.canvasCtx.arc(x, y, r, 0, TAU);
			this.canvasCtx.fill();
		});
		this.canvasCtx.drawImage(this.imgB, 0, 0);
	}
}
