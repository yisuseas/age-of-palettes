import type { EventMap, EventName } from "./types";
import { PaletteController } from "./Controllers/PaletteController";
import { PlayerController } from "./Controllers/PlayerController";
import { PaletteModel } from "./Models/PaletteModel";
import { PlayerView } from "./Views/PlayerView";
import { PaletteView } from "./Views/PaletteView";

const TUTORIAL_STORAGE_KEY = "tutorial-seen";

export class App {
	private paletteController: PaletteController;
	private playerController: PlayerController;

	constructor() {
		const paletteModel = new PaletteModel();

		const playerView = new PlayerView();
		const paletteView = new PaletteView();

		this.playerController = new PlayerController(
			paletteModel.playerData["Player 1"],
			playerView,
			this
		);
		this.paletteController = new PaletteController(
			paletteModel,
			paletteView,
			this
		);
	}

	run() {
		this.paletteController.run();
		this.playerController.run();
		this.setupTutorial();
	}

	public dispatch<EN extends EventName>(eventName: EN, payload: EventMap[EN]) {
		// TODO: fix type assertion here, payload type should be infered
		if (eventName === "change-player") {
			this.playerController.set(payload as EventMap["change-player"]);
		} else if (eventName === "change-swatch") {
			this.paletteController.updateSwatch(
				payload as EventMap["change-swatch"]
			);
		}
	}

	private setupTutorial() {
		const dialog = document.getElementById("tutorial") as HTMLDialogElement;

		window.addEventListener("keydown", (event) => {
			if (event.code === "F1") {
				dialog.showModal();
			}
		});

		const openBtn = document.getElementById(
			"open-tutorial"
		) as HTMLButtonElement;
		const closeBtn = document.getElementById(
			"close-tutorial"
		) as HTMLButtonElement;
		openBtn.addEventListener("click", () => dialog.showModal());
		closeBtn.addEventListener("click", () => dialog.close());

		if (!window.localStorage.getItem(TUTORIAL_STORAGE_KEY)) {
			dialog.showModal();
		}
		dialog.addEventListener("close", () => {
			window.localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
		});
	}
}
