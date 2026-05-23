import type { PlayerModel } from "./Models/PlayerModel";
import type { PlayerName, ViewProps } from "./types";
import type { PaletteController } from "./Controllers/PaletteController";
import type { PlayerController } from "./Controllers/PlayerController";

export type EventMap = {
	"change-player": {
		name: PlayerName;
		model: PlayerModel;
	} | null;

	"change-swatch": ViewProps;
};

type EventName = keyof EventMap;

const TUTORIAL_STORAGE_KEY = "tutorial-seen";

export class Mediator {
	private paletteController: PaletteController;
	private playerController: PlayerController;

	constructor(
		paletteController: PaletteController,
		playerController: PlayerController
	) {
		this.paletteController = paletteController;
		this.paletteController.setMediator(this);
		this.playerController = playerController;
		this.playerController.setMediator(this);
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
