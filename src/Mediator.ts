import type { PlayerModel } from "./Models/PlayerModel";
import type { PlayerName } from "./types";
import type { PaletteController } from "./Controllers/PaletteController";
import type { PlayerController } from "./Controllers/PlayerController";

export type EventMap = {
	"change-player": {
		name: PlayerName;
		model: PlayerModel;
	} | null;

	"change-swatch": {
		cssProps: string;
	};
};

type EventName = keyof EventMap;

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
	}

	public dispatch<EN extends EventName>(eventName: EN, payload: EventMap[EN]) {
		// TODO: fix type assertion here, payload type should be infered
		if (eventName === "change-player") {
			this.playerController.set(payload as EventMap["change-player"]);
		} else if (eventName === "change-swatch") {
			this.paletteController.updateSwatch(
				(payload as EventMap["change-swatch"]).cssProps
			);
		}
	}
}
