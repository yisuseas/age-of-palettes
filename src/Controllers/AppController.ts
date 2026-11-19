import type { ColorInstance } from "color";
import type { Channel, ColorInput, PlayerName, PlayerProperty } from "../types";
import type AppModel from "../Models/AppModel";
import type AppView from "../Views/AppView";
import Color from "color";
import { saveAs } from "file-saver";
import {
	MAX_CHANNEL_VALUE,
	MULTI_CHANNEL_SPACES,
	PLAYER_NAMES,
	PLAYER_PROPERTIES,
} from "../constant";
import { getElementById, kebab } from "../utils";

const VALID_PLAYER_CODE = /^(Digit|Numpad)[1-9]$/;
const KEY_PREFIX = /Digit|Numpad/;
const VALID_HEX = /^\#[\da-f]{6}$/i;

const TUTORIAL_STORAGE_KEY = "tutorial-seen";

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

type SelectedState =
	| { player: null; property: null }
	| { player: PlayerName; property: null }
	| { player: PlayerName; property: PlayerProperty };

export default class AppController {
	model: AppModel;
	view: AppView;
	selected: SelectedState;

	constructor(model: AppModel, view: AppView) {
		this.model = model;
		this.view = view;
		this.selected = { player: null, property: null };
	}

	run(): void {
		const iconColors = PLAYER_NAMES.map((playerName) =>
			this.model.getColor(playerName, "Icons")
		);
		this.view.initialRender(iconColors, this.model.getPreviewAllColors());
		this.bindEvents();
	}

	private bindEvents(): void {
		// Tutorial
		const dialog = getElementById<HTMLDialogElement>("tutorial");
		window.addEventListener("keydown", (event) => {
			if (event.code === "F1") {
				dialog.showModal();
			}
		});
		const openBtn = getElementById<HTMLButtonElement>("open-tutorial");
		const closeBtn = getElementById<HTMLButtonElement>("close-tutorial");
		openBtn.addEventListener("click", () => dialog.showModal());
		closeBtn.addEventListener("click", () => dialog.close());
		if (!window.localStorage.getItem(TUTORIAL_STORAGE_KEY)) {
			dialog.showModal();
		}
		dialog.addEventListener("close", () => {
			window.localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
		});

		// Download
		let downloading = false;
		const downloadBtn = getElementById<HTMLButtonElement>("download");
		downloadBtn.addEventListener("click", () => {
			if (downloading) return; // Download already in progress
			downloading = true;
			this.model
				.modData()
				.then((data) => {
					saveAs(data, "MyPalette.zip");
				})
				.catch((err) => {
					console.error(err);
				})
				.finally(() => {
					downloading = false;
				});
		});

		// Hotkeys
		const modKey = new ModKey((event) => event.code.startsWith("Shift"));
		window.addEventListener("keydown", (event) => {
			if (event.code === "Escape") {
				// Deselect latest picked
				if (this.selected.property) {
					this.toggleProperty(this.selected.property);
				} else if (this.selected.player) {
					this.togglePlayer(this.selected.player);
				}
			} else if (modKey.isPressed && VALID_PLAYER_CODE.test(event.code)) {
				const idx = parseInt(event.code.replace(KEY_PREFIX, "")) - 1;
				this.togglePlayer(PLAYER_NAMES[idx]);
			}
		});

		// Toggles
		PLAYER_NAMES.forEach((playerName) => {
			const btn = getElementById<HTMLButtonElement>(kebab(playerName));
			btn.addEventListener("click", () => this.togglePlayer(playerName));
		});
		PLAYER_PROPERTIES.forEach((property) => {
			const btn = getElementById<HTMLButtonElement>(kebab(property));
			btn.addEventListener("click", () => this.toggleProperty(property));
		});

		// Inputs
		const updateColor = (
			player: PlayerName,
			property: PlayerProperty,
			newColor: ColorInstance,
			skip?: ColorInput
		) => {
			this.model.setColor(player, property, newColor);
			if (property === "Icons") {
				this.view.updatePlayer(player, newColor);
			}
			this.view.updateProperty(property, newColor);
			this.view.updateEditor(newColor, skip);
			this.view.updatePreviewSingle(this.model.getPlayer(player));
		};

		const handleHexInput = (input: HTMLInputElement, skip: ColorInput) => {
			if (!this.selected.property) return; // <- For type safety
			const newColor = new Color(input.value);
			updateColor(this.selected.player, this.selected.property, newColor, skip);
		};

		const picker = getElementById<HTMLInputElement>("picker");
		picker.addEventListener("input", () => handleHexInput(picker, "picker"));

		const hexInput = getElementById<HTMLInputElement>("hex");
		hexInput.addEventListener("input", () => {
			console.log(hexInput.value);
			if (!VALID_HEX.test(hexInput.value)) return;
			handleHexInput(hexInput, "hex");
		});

		const validate = (str: string, channel: Channel) => {
			const int = parseInt(str);
			if (!isFinite(int)) return null;
			if (int < 0) return null;
			if (int > MAX_CHANNEL_VALUE[channel]) return null;
			return int;
		};

		MULTI_CHANNEL_SPACES.forEach((space) => {
			(space.split("") as Channel[]).forEach((channel) => {
				const inputElement = getElementById<HTMLInputElement>(`${space}-${channel}`);

				const handleNumberInput = () => {
					if (!this.selected.property) return; // <- For type safety
					const value = validate(inputElement.value, channel);
					if (typeof value !== "number") return;
					const clone = this.model
						.getColor(this.selected.player, this.selected.property)
						[space]()
						.object();
					clone[channel] = value;
					updateColor(
						this.selected.player,
						this.selected.property,
						new Color(clone),
						space
					);
				};

				inputElement.addEventListener("input", handleNumberInput);

				const controls = inputElement.nextElementSibling!;
				controls.querySelector("button.increase")!.addEventListener("click", () => {
					inputElement.stepUp();
					handleNumberInput();
				});
				controls.querySelector("button.decrease")!.addEventListener("click", () => {
					inputElement.stepDown();
					handleNumberInput();
				});
			});
		});

		// Copy Unit color button
		const copyBtn = getElementById<HTMLButtonElement>("copy-unit");
		copyBtn.addEventListener("click", () => {
			if (!this.selected.property || this.selected.property === "Unit") return;
			const unit = this.model.getColor(this.selected.player, "Unit");
			updateColor(this.selected.player, this.selected.property, new Color(unit));
		});
	}

	private togglePlayer(playerName: PlayerName): void {
		const prev = { ...this.selected };
		const next =
			this.selected.player !== playerName
				? { player: playerName, property: prev.property }
				: { player: null, property: null };
		this.selected = next as SelectedState;
		this.view.updateSelectedListItem<PlayerName>(prev.player, next.player);

		if (next.player) {
			const palettePlayer = this.model.getPlayer(playerName);
			const colors = Object.values(palettePlayer);
			this.view.showPlayerProperties(playerName, colors);
			next.property && this.view.updateEditor(palettePlayer[next.property]);
			this.view.updatePreviewSingle(palettePlayer);
		} else {
			this.view.hidePlayerProperties();
			this.view.updateSelectedListItem<PlayerProperty>(prev.property, null);
			this.view.hideEditor();
			this.view.updatePreviewAll(this.model.getPreviewAllColors());
		}
	}

	private toggleProperty(property: PlayerProperty): void {
		const prev = this.selected.property;
		const next = this.selected.property !== property ? property : null;
		this.selected.property = next;
		this.view.updateSelectedListItem<PlayerProperty>(prev, next);
		if (this.selected.property) {
			const color = this.model.getColor(this.selected.player, property);
			this.view.showEditor(property, color);
		} else {
			this.view.hideEditor();
		}
	}
}
