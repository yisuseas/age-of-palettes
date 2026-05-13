import { PaletteModel } from "./Models/PaletteModel";
import { PlayerView } from "./Views/PlayerView";
import { PaletteView } from "./Views/PaletteView";
import { PlayerController } from "./Controllers/PlayerController";
import { PaletteController } from "./Controllers/PaletteController";
import { Mediator } from "./Mediator";

const paletteModel = new PaletteModel();

const playerView = new PlayerView();
const paletteView = new PaletteView();

const playerController = new PlayerController(
	paletteModel.playerData["Player 1"],
	playerView
);
const paletteController = new PaletteController(paletteModel, paletteView);

const mediator = new Mediator(paletteController, playerController);
mediator.run();
